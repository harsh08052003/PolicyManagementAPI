import express from "express";
const app = express();
import { logRequestBody } from './helper/logger.js'
import userPath from './user/route.js'
import uploadPath from './upload/route.js'
import schedule from './schedule/route.js'
import cpuPath from './cpu/route.js'

app.use(logRequestBody)

app.use('/user',userPath)
app.use('/upload',uploadPath)
app.use('/schedule',schedule)
app.use('/cpu',cpuPath)
export default app;