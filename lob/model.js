import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "LOB"

export const getAllLobs = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get lob", error }
  }
}

export const insertLobs = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert lob", error }
  }
}

export const getLobsByIds = async (body) => {
  try {
    let query = {
      _id: { $in: body.lobIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get lob", error }
  }
}
