import moment from "moment";
import { getMessageQueue, startMessageWorker } from "./queue.js";
import * as apiResponse from "../helper/response.js";

export const scheduleMessage = async (request, response, next) => {
    try {
        if (request.body.message == undefined || request.body.message == "") return apiResponse.validationError(response, "Please provide message")
        if (request.body.day == undefined || request.body.day == "") return apiResponse.validationError(response, "Please provide day")
        if (request.body.time == undefined || request.body.time == "") return apiResponse.validationError(response, "Please provide time")

        let target = moment(request.body.day + " " + request.body.time, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss", "DD-MM-YYYY HH:mm"], true);
        if (!target.isValid()) return apiResponse.validationError(response, "Invalid day or time, use YYYY-MM-DD and HH:mm")

        let delay = target.valueOf() - Date.now();
        if (delay < 0) return apiResponse.validationError(response, "Please provide a future day and time")

        const ready = await startMessageWorker();
        if (!ready) return apiResponse.ErrorResponse(response, "Failed to schedule message", "redis is not running")

        const job = await getMessageQueue().add(
            "insert-message",
            { message: request.body.message, day: request.body.day, time: request.body.time },
            { delay: delay }
        );
        request.body.scheduleInfo = {
            jobId: job.id,
            runAt: target.clone().utcOffset("+05:30", true).format("YYYY-MM-DDTHH:mm:ssZ")
        }
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}

export const listJobs = async (request, response, next) => {
    try {
        const ready = await startMessageWorker();
        if (!ready) return apiResponse.ErrorResponse(response, "Failed to list jobs", "redis is not running")

        const queue = getMessageQueue();
        const counts = await queue.getJobCounts("waiting", "delayed", "active", "completed", "failed");
        const jobs = await queue.getJobs(["waiting", "delayed", "active", "completed", "failed"], 0, 100);

        let jobList = [];
        for (let i = 0; i < jobs.length; i++) {
            let job = jobs[i];
            const state = await job.getState();
            jobList.push({
                id: job.id,
                name: job.name,
                state: state,
                data: job.data,
                delay: job.opts.delay || 0,
                timestamp: job.timestamp,
                processedOn: job.processedOn || null,
                finishedOn: job.finishedOn || null,
                failedReason: job.failedReason || null
            });
        }

        request.body.jobList = {
            counts: counts,
            jobs: jobList
        }
        return next()
    } catch (error) {
        return apiResponse.somethingResponse(response, error.message)
    }
}
