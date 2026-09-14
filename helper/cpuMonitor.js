import os from "os";
import fs from "fs";
import path from "path";

function cpuTimes() {
  let cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (let i = 0; i < cpus.length; i++) {
    let times = cpus[i].times;
    idle += times.idle;
    total += times.user + times.nice + times.sys + times.irq + times.idle;
  }

  return { idle: idle, total: total };
}

export function readCpuUsage() {
  return new Promise(function (resolve) {
    let start = cpuTimes();
    setTimeout(function () {
      let end = cpuTimes();
      let idleDiff = end.idle - start.idle;
      let totalDiff = end.total - start.total;
      let usage = 0;
      if (totalDiff > 0) {
        usage = (1 - idleDiff / totalDiff) * 100;
      }
      resolve(Number(usage.toFixed(2)));
    }, 1000);
  });
}

function restartServer() {
  let flag = path.join(process.cwd(), "restart.json");
  fs.writeFileSync(flag, JSON.stringify({ restartedAt: new Date().toISOString() }));
}

export function startCpuMonitor() {
  let limit = Number(process.env.CPU_LIMIT) || 70;
  let holdMs = (Number(process.env.CPU_HOLD_SECONDS) || 45) * 1000;
  let highSince = null;
  let restarting = false;

  setInterval(async function () {
    try {
      const usage = await readCpuUsage();
      console.log("CPU usage:", usage + "%");

      if (usage >= limit) {
        if (!highSince) highSince = Date.now();
        let heldFor = Date.now() - highSince;
        let heldSec = Math.round(heldFor / 1000);
        console.log("cpu above " + limit + "% for " + heldSec + "s");

        if (!restarting && heldFor >= holdMs) {
          restarting = true;
          console.log("cpu stayed above " + limit + "% for " + heldSec + "s, restarting server");
          restartServer();
        }
      } else {
        highSince = null;
      }
    } catch (err) {
      console.log("cpu check failed", err.message);
    }
  }, 5000);
}
