import { createServer } from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import routes from './route.js'
import fileUpload from 'express-fileupload';

import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit';
import { connectToDB } from './config/mongo.js'
import { startCpuMonitor } from './helper/cpuMonitor.js'
import { startMessageWorker } from './schedule/queue.js'
import { ErrorResponse } from './helper/response.js'
dotenv.config({ quiet: true })

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
//image upload

app.use(fileUpload());

const limiter = rateLimit({
  windowMs : 60 * 10 * 1000, //10 min
  max : 1500, //1500 requests from same IP
  message : "Too many request from this IP. Please try again after some time!"
})

app.use(limiter)
app.use('',routes)
app.use(function (err, req, res, next) {
  return ErrorResponse(res, "something went wrong", err.message)
})
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPath = path.join(__dirname, "assets");
if (!fs.existsSync(assetsPath)) {
  fs.mkdirSync(assetsPath, { recursive: true });
}

let port = process.env.PORT;

createServer(app).listen(port,"0.0.0.0",()=>{
  console.log('\n================================== \x1b[35mPolicy Management API is runnning at ' + port +" \x1B[39m==================================\n");
  startMessageWorker()
  startCpuMonitor()
});
