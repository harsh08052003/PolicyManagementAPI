export function successResponse (res, msg) {
	let responseData = {
		status: 200,
		message: msg
	};
	logResponse(responseData)
	return res.status(200).json(responseData);
}



export function partialSuccessResponse (res, msg) {
	let responseData = {
		status: 206,
		message: msg
	};
	logResponse(responseData)
	return res.status(206).json(responseData);
}




export function successResponseWithData (res, msg, data) {
	let responseData = {
		status: 200,
		message: msg,
		data: data
	};
	logResponse(responseData)
	return res.status(200).json(responseData);
}



export function ErrorResponse (res, msg, err) {
	let responseData = {
		status: 500,
		message: msg,
		Error:err
	};
	logResponse(responseData)
	return res.status(500).json(responseData);
}

export function notFoundResponse (res, msg) {
	let responseData = {
		status: 404,
		message: msg,
	};
	logResponse(responseData)
	return res.status(404).json(responseData);
}

export function validationErrorWithData (res, msg, data) {
	let responseData = {
		status: 400,
		message: msg,
		data: data
	};
	logResponse(responseData)
	return res.status(400).json(responseData);
}

export function validationError (res, msg) {
	let responseData = {
		status: 400,
		message: msg
	};
	logResponse(responseData)
	return res.status(400).json(responseData);
}

export function unauthorizedResponse (res, msg) {
	let responseData = {
		status: 401,
		message: msg,
	};
	logResponse(responseData)
	return res.status(401).json(responseData);
}
export function duplicateResponse (res, msg) {
	let responseData = {
		status: 409,
		message: msg,
	};
	logResponse(responseData)
	return res.status(responseData.status).json(responseData);
}

export function customResponse (res, msg, data, info) {
	let responseData = {
		status: 400,
		message: msg,
		data:data,
		info,
	};
	logResponse(responseData)
	return res.status(400).json(responseData);
}
export function somethingResponse (res,info) {
	let responseData = {
		status: 400,
		message: "Something went wrong! Please try again later.",
		info
	};
	logResponse(responseData)
	return res.status(400).json(responseData);
}

function logResponse(responseData){
	// console.error("\x1B[36m"+JSON.stringify(responseData, null, 2)+"\x1B[39m")
	console.error("=======================================================\n");
}
