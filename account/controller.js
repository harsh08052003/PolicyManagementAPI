import * as accountModel from './model.js'
import * as apiResponse from '../helper/response.js'

export const getMap = async (request, response, next) => {
    try {
        let accountIds = []
        let seen = {}

        ;(request.body.policies || []).forEach((p) => {
            if (p.accountId && !seen[p.accountId.toString()]) {
                seen[p.accountId.toString()] = true
                accountIds.push(p.accountId)
            }
        })

        request.body.accountIds = accountIds
        let accountMap = {}

        if (accountIds.length) {
            const result = await accountModel.getAccountsByIds(request.body)
            if (!result.status) throw {}

            result.data.forEach((item) => {
                accountMap[item._id.toString()] = item
            })
        }

        request.body.accountMap = accountMap
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
