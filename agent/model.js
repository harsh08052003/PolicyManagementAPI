import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "Agent"

export const getAllAgents = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get agents", error }
  }
}

export const insertAgents = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert agents", error }
  }
}

export const getAgentsByIds = async (body) => {
  try {
    let query = {
      _id: { $in: body.agentIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get agents", error }
  }
}
