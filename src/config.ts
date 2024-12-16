import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 9000;
export const MONGODB_URI = process.env.MONGO_URI || "http://localhost:27017/";
export const DB_NAME = process.env.DB_NAME || "weather_data";
export const API_BASE_URL =
  process.env.API_BASE_URL ||
  "https://us-east1-climacell-platform-production.cloudfunctions.net/weather-data";
export const CONCURRENCY = 60;
export const METADATA_BATCHES_COLLECTION = "batches_metadata";
export const BATCH_FORECAST_COLLECTION = "forecast_data_";
