import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.zurpipi.mongodb.net`;
const dbName = process.env.DB_NAME || "policyManagement";

let client;

export async function connectToDB() {
  try {
    if (!client) {
      // client = new MongoClient(uri, { useUnifiedTopology: true });
      client = new MongoClient(uri);

      await client.connect();
      const db = client.db(dbName);

      return db;
    }
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}
