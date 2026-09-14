import { Router } from 'express';
const router = Router();

import * as schedule from './controller.js';
import * as apiResponse from '../helper/response.js';

router.use((request, response, next) => {
    console.log('\nSchedule middleware');
    console.log(request.originalUrl)
    request.body.endpoint = request.originalUrl
    console.log('-------------------------------------------------------');
    return next();
})

router.post('/message',
    schedule.scheduleMessage,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "Message Scheduled Successfully", request.body.scheduleInfo)
    }
)

router.get('/jobs',
    schedule.listJobs,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "Jobs Found Successfully", request.body.jobList)
    }
)

export default router
