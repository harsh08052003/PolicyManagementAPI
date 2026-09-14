import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "Account"

export const getAllAccounts = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get accounts", error }
  }
}

export const insertAccounts = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert accounts", error }
  }
}

export const getAccountsByIds = async (body) => {
  try {
    let query = {
      _id: { $in: body.accountIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get accounts", error }
  }
}
