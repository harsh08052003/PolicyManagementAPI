import { Router } from 'express';
const router = Router();

import * as upload from './controller.js';
import * as apiResponse from '../helper/response.js';

router.use((request, response, next) => {
    console.log('\nUpload middleware');
    console.log(request.originalUrl)
    request.body.endpoint = request.originalUrl
    console.log('-------------------------------------------------------');
    return next();
})

router.post('/excel',
    upload.uploadSheet,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "File Uploaded Successfully", request.body.uploadResult)
    }
)

export default router
