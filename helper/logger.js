
export const logRequestBody = (request, response, next) => {
    try {
        if (!request.body) request.body = {}
        console.log("\n-------------------------------------------------------")
        console.log(`${request.method} ${request.originalUrl}`)
        console.log("Request Body:", JSON.stringify(request.body || {}, null, 2))
        console.log("-------------------------------------------------------")

        response.on("finish", () => {
            console.log(`${request.method} ${request.originalUrl} => Status: ${response.statusCode}`)
            console.log("-------------------------------------------------------\n")
        })
    } catch (error) {
        console.error("Failed to log request:", error?.message || error)
    }

    return next()
}
