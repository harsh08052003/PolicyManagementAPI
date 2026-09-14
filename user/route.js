import { Router } from 'express';
const router = Router();

import * as user from './controller.js';
import * as policy from '../policy/controller.js';
import * as lob from '../lob/controller.js';
import * as agent from '../agent/controller.js';
import * as carrier from '../carrier/controller.js';
import * as account from '../account/controller.js';
import * as apiResponse from '../helper/response.js';

router.use((request, response, next) => {
    console.log('\nUser middleware');
    console.log(request.originalUrl)
    request.body.endpoint = request.originalUrl
    console.log('-------------------------------------------------------');
    return next();
})

router.post('/search',
    user.getByName,
    policy.getByUsers,
    lob.getMap,
    agent.getMap,
    carrier.getMap,
    account.getMap,
    policy.mergePolicyInfo,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "Policy Info Found Successfully", request.body.policyInfo)
    }
)

router.get('/policies/get',
    policy.policyByUsers,
    lob.getMap,
    agent.getMap,
    carrier.getMap,
    account.getMap,
    policy.mergeAggregatedPolicies,
    (request, response, next) => {
        return apiResponse.successResponseWithData(response, "User Policies Found Successfully", request.body.policies)
    }
)

export default router
