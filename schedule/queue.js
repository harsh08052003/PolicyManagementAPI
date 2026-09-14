import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { redisOptions } from "../config/redis.js";
import { insertScheduledMessage } from "./model.js";

let messageQueue;
let workerStarted = false;

function checkRedis() {
  let redis = new IORedis({
    host: redisOptions.host,
    port: redisOptions.port,
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    lazyConnect: true,
    retryStrategy: function () {
      return null;
    }
  });
  redis.on("error", function () {});

  return redis.connect().then(function () {
    return redis.ping();
  }).then(function () {
    return redis.quit();
  }).catch(function (err) {
    try {
      redis.disconnect();
    } catch (e) {}
    throw err;
  });
}

export function getMessageQueue() {
  if (!messageQueue) {
    messageQueue = new Queue("scheduled-messages", {
      connection: redisOptions
    });
    messageQueue.on("error", function (err) {
      console.log("redis queue error", err.message);
    });
  }
  return messageQueue;
}

export async function startMessageWorker() {
  if (workerStarted) return true;

  try {
    await checkRedis();
  } catch (err) {
    console.log("redis is not running, schedule worker skipped");
    return false;
  }

  workerStarted = true;

  const worker = new Worker(
    "scheduled-messages",
    async (job) => {
      let payload = job.data || {};
      await insertScheduledMessage({
        message: payload.message,
        day: payload.day,
        time: payload.time,
        insertedAt: new Date()
      });
      return true;
    },
    { connection: redisOptions }
  );

  worker.on("completed", (job) => {
    console.log("scheduled message inserted", job.id);
  });

  worker.on("failed", (job, err) => {
    console.log("scheduled message failed", job && job.id, err && err.message);
  });

  worker.on("error", (err) => {
    console.log("schedule worker error", err.message);
  });

  return true;
}
