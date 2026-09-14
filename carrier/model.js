import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "Carrier"

export const getAllCarriers = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get carriers", error }
  }
}

export const insertCarriers = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert carriers", error }
  }
}

export const getCarriersByIds = async (body) => {
  try {
    let query = {
      _id: { $in: body.carrierIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get carriers", error }
  }
}
