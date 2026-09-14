import * as agentModel from './model.js'
import * as apiResponse from '../helper/response.js'

export const getMap = async (request, response, next) => {
    try {
        let agentIds = []
        let seen = {}

        ;(request.body.policies || []).forEach((p) => {
            if (p.agentId && !seen[p.agentId.toString()]) {
                seen[p.agentId.toString()] = true
                agentIds.push(p.agentId)
            }
        })

        request.body.agentIds = agentIds
        let agentMap = {}

        if (agentIds.length) {
            const result = await agentModel.getAgentsByIds(request.body)
            if (!result.status) throw {}

            result.data.forEach((item) => {
                agentMap[item._id.toString()] = item
            })
        }

        request.body.agentMap = agentMap
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
