import { createMany, getMany } from '../helper/mongo.js';

const collection_name = "User"

export const getAllUsers = async (body) => {
  try {
    return await getMany({}, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get users", error }
  }
}

export const insertUsers = async (docs) => {
  try {
    return await createMany(docs, collection_name)
  } catch (error) {
    return { status: false, message: "failed to insert users", error }
  }
}

export const findUsersByName = async (body) => {
  try {
    let query = {
      firstName: { $regex: body.name, $options: "i" }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get user", error }
  }
}

export const getUsersByIds = async (body) => {
  try {
    let query = {
      _id: { $in: body.userIds }
    }

    return await getMany(query, collection_name)
  } catch (error) {
    return { status: false, message: "failed to get users", error }
  }
}
