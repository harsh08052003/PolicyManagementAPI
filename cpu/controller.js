import { readCpuUsage } from '../helper/cpuMonitor.js'
import * as apiResponse from '../helper/response.js'

export const getUsage = async (request, response, next) => {
    try {
        const usage = await readCpuUsage()
        request.body.cpuUsage = { cpu: usage }
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
