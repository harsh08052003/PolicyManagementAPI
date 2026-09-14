import { create } from '../helper/mongo.js';

const collection_name = "ScheduledMessage"

export const insertScheduledMessage = async (body) => {
  try {
    let query = {
      message: body.message,
      day: body.day,
      time: body.time,
      insertedAt: body.insertedAt || new Date()
    }

    return await create(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert scheduled message", error }
  }
}
