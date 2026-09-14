import * as carrierModel from './model.js'
import * as apiResponse from '../helper/response.js'

export const getMap = async (request, response, next) => {
    try {
        let carrierIds = []
        let seen = {}

        ;(request.body.policies || []).forEach((p) => {
            if (p.companyId && !seen[p.companyId.toString()]) {
                seen[p.companyId.toString()] = true
                carrierIds.push(p.companyId)
            }
        })

        request.body.carrierIds = carrierIds
        let carrierMap = {}

        if (carrierIds.length) {
            const result = await carrierModel.getCarriersByIds(request.body)
            if (!result.status) throw {}

            result.data.forEach((item) => {
                carrierMap[item._id.toString()] = item
            })
        }

        request.body.carrierMap = carrierMap
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
