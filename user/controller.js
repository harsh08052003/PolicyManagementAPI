import * as userModel from './model.js'
import * as apiResponse from '../helper/response.js'

export const getByName = async (request, response, next) => {
    try {

        if (request.body.name == undefined || request.body.name == "") return apiResponse.validationError(response, "Please provide name")

        const result = await userModel.findUsersByName(request.body)

        if (!result.status || !result.data || result.data.length == 0) return apiResponse.notFoundResponse(response, "User not found")

        request.body.users = result.data

        request.body.userIds = result.data.map((u) => u._id)
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
