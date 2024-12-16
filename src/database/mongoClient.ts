import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";
import { DB_NAME, MONGODB_URI } from "../config";

dotenv.config();

const client = new MongoClient(MONGODB_URI);
let db: Db | null = null;

export const connectToDB = async (): Promise<Db> => {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB", DB_NAME);
  }
  return db;
};
export function getDB(): Db {
  if (!db) {
    throw new Error("DB not connected, connect to DB first.");
  }
  return db;
}

export const closeDB = async () => {
  if (client) {
    client.close();
    db = null;
    console.log("MongoDB connection closed");
  }
};
