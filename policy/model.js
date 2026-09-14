import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "Policy"

export const getAllPolicies = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get policies", error }
  }
}

export const insertPolicies = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert policies", error }
  }
}

export const findPoliciesByUserIds = async (body) => {
  try {
    let query = {
      userId: { $in: body.userIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get policy", error }
  }
}

export const getPoliciesByUsers = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get policies", error }
  }
}
