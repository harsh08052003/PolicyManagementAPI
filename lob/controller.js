import * as lobModel from './model.js'
import * as apiResponse from '../helper/response.js'

export const getMap = async (request, response, next) => {
    try {
        let lobIds = []
        let seen = {}

        ;(request.body.policies || []).forEach((p) => {
            if (p.categoryId && !seen[p.categoryId.toString()]) {
                seen[p.categoryId.toString()] = true
                lobIds.push(p.categoryId)
            }
        })

        request.body.lobIds = lobIds
        let lobMap = {}

        if (lobIds.length) {
            const result = await lobModel.getLobsByIds(request.body)
            if (!result.status) throw {}

            result.data.forEach((item) => {
                lobMap[item._id.toString()] = item
            })
        }

        request.body.lobMap = lobMap
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
