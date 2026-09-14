import * as policyModel from './model.js'
import * as userModel from '../user/model.js'
import * as apiResponse from '../helper/response.js'

export const getByUsers = async (request, response, next) => {
    try {
        const result = await policyModel.findPoliciesByUserIds(request.body)

        if (!result.status) throw {}

        request.body.policies = result.data
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}

export const mergePolicyInfo = async (request, response, next) => {
    try {
        let lobMap = request.body.lobMap || {}
        let agentMap = request.body.agentMap || {}
        let carrierMap = request.body.carrierMap || {}
        let accountMap = request.body.accountMap || {}

        let policies = (request.body.policies || []).map((p) => {
            return {
                ...p,
                category: p.categoryId ? lobMap[p.categoryId.toString()] || null : null,
                company: p.companyId ? carrierMap[p.companyId.toString()] || null : null,
                agent: p.agentId ? agentMap[p.agentId.toString()] || null : null,
                account: p.accountId ? accountMap[p.accountId.toString()] || null : null
            }
        })

        request.body.policyInfo = request.body.users.map((u) => {
            return {
                ...u,
                policies: policies.filter((p) => p.userId.toString() === u._id.toString())
            }
        })
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}

export const policyByUsers = async (request, response, next) => {
    try {
        const result = await policyModel.getPoliciesByUsers(request.body)

        if (!result.status) throw {}

        request.body.policies = result.data
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}

export const mergeAggregatedPolicies = async (request, response, next) => {
    try {
        let lobMap = request.body.lobMap || {}
        let agentMap = request.body.agentMap || {}
        let carrierMap = request.body.carrierMap || {}
        let accountMap = request.body.accountMap || {}

        let enriched = (request.body.policies || []).map((p) => {
            return {
                ...p,
                category: p.categoryId ? lobMap[p.categoryId.toString()] || null : null,
                company: p.companyId ? carrierMap[p.companyId.toString()] || null : null,
                agent: p.agentId ? agentMap[p.agentId.toString()] || null : null,
                account: p.accountId ? accountMap[p.accountId.toString()] || null : null
            }
        })

        let userIds = []
        let seen = {}
        enriched.forEach((p) => {
            if (p.userId && !seen[p.userId.toString()]) {
                seen[p.userId.toString()] = true
                userIds.push(p.userId)
            }
        })

        let userMap = {}
        if (userIds.length) {
            const usersResult = await userModel.getUsersByIds({ userIds })
            if (!usersResult.status) throw {}

            usersResult.data.forEach((u) => {
                userMap[u._id.toString()] = u
            })
        }

        let grouped = {}
        enriched.forEach((p) => {
            let key = p.userId.toString()
            if (!grouped[key]) {
                let u = userMap[key] || {}
                grouped[key] = {
                    userId: p.userId,
                    user: {
                        firstName: u.firstName,
                        email: u.email,
                        phone: u.phone,
                        userType: u.userType
                    },
                    totalPolicies: 0,
                    policies: []
                }
            }

            grouped[key].policies.push({
                policyNumber: p.policyNumber,
                policyStartDate: p.policyStartDate,
                policyEndDate: p.policyEndDate,
                categoryId: p.categoryId,
                companyId: p.companyId,
                category: p.category,
                company: p.company,
                agent: p.agent,
                account: p.account
            })
            grouped[key].totalPolicies++
        })

        request.body.policies = Object.values(grouped)
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
