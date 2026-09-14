import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as apiResponse from "../helper/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, "..", "assets");

function runWorker(filePath) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let worker = new Worker(new URL("./worker.js", import.meta.url), {
      workerData: { filePath }
    });

    worker.on("message", (msg) => {
      if (settled) return;
      settled = true;
      if (msg && msg.error) {
        reject(new Error(msg.error));
      } else {
        resolve(msg);
      }
    });

    worker.on("error", (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    worker.on("exit", (code) => {
      if (settled) return;
      if (code !== 0) {
        settled = true;
        reject(new Error("worker stopped with exit code " + code));
      }
    });
  });
}

export const uploadSheet = async (request, response, next) => {
  try {
    if (!request.files || !Object.keys(request.files).length) {
      return apiResponse.validationError(response, "Please upload a xlsx or csv file");
    }

    let uploaded = request.files.file || request.files.data || request.files.sheet || Object.values(request.files)[0];
    if (!uploaded) {
      return apiResponse.validationError(response, "Please upload a xlsx or csv file");
    }

    let ext = path.extname(uploaded.name || "").toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".csv") {
      return apiResponse.validationError(response, "Only xlsx or csv files are allowed");
    }

    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }

    let safeName = (uploaded.name || "data.xlsx").replace(/\s+/g, "_");
    let filePath = path.join(assetsPath, Date.now() + "-" + safeName);
    await uploaded.mv(filePath);

    const result = await runWorker(filePath);
    request.body.uploadResult = result;
    return next();
  } catch (error) {
    return apiResponse.somethingResponse(response, error.message);
  }
}
