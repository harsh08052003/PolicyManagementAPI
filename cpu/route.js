import { Router } from 'express';
const router = Router();

import * as cpu from './controller.js';
import * as apiResponse from '../helper/response.js';

router.use((request, response, next) => {
    console.log('\nCPU middleware');
    console.log(request.originalUrl)
    request.body.endpoint = request.originalUrl
    console.log('-------------------------------------------------------');
    return next();
})

router.get('/usage/get',
    cpu.getUsage,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "CPU Usage Found Successfully", request.body.cpuUsage)
    }
)

export default router
