import { Db } from "mongodb";
import {
  BATCH_FORECAST_COLLECTION,
  METADATA_BATCHES_COLLECTION,
} from "../config";
import { connectToDB } from "../database/mongoClient";
import { ForecastItem, Status, SummarizeItem } from "../models/types";

export const getWeatherForcasts2 = async (
  latitude: number,
  longitude: number
): Promise<ForecastItem[]> => {
  const db: Db = await connectToDB();
  const activeBatches = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .find({ status: Status.ACTIVE })
    .toArray();

  const promises = activeBatches.map(async (activeBatch) => {
    const name = `${BATCH_FORECAST_COLLECTION}${activeBatch.batch_id}`;
    const collection = db.collection(name);
    const partial = await collection.findOne({ latitude, longitude });

    return {
      ...partial,
      forecastTime: activeBatch.forecast_time,
    } as ForecastItem;
  });

  return await Promise.all(promises);
};

export const getWeatherForcasts = async (
  latitude: number,
  longitude: number
): Promise<ForecastItem[]> => {
  const db: Db = await connectToDB();
  const activeBatches = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .find({ status: Status.ACTIVE })
    .toArray();

  const promises = activeBatches.map(async (activeBatch) => {
    const name = `${BATCH_FORECAST_COLLECTION}${activeBatch.batch_id}`;
    const collection = db.collection(name);
    const partial = await collection.findOne({ latitude, longitude });

    if (partial) {
      return {
        ...partial,
        forecastTime: activeBatch.forecast_time,
      } as unknown as ForecastItem;
    }
    return null;
  });

  const results = await Promise.all(promises);
  return results.filter((item): item is ForecastItem => item !== null);
};

export const getSummaryWeather = async (
  latitude: number,
  longitude: number
): Promise<SummarizeItem | null> => {
  const forecasts = await getWeatherForcasts(latitude, longitude);
  if (forecasts.length === 0) {
    return null;
  }
  const temperatures = forecasts.map((f) => f.temperature);
  const precipitations = forecasts.map((f) => f.precipitation_rate);
  const humidities = forecasts.map((f) => f.humidity);

  const max = (arr: number[]) => Math.max(...arr);
  const min = (arr: number[]) => Math.min(...arr);
  const avg = (arr: number[]) =>
    arr.reduce((sum, val) => sum + val, 0) / arr.length;

  const result = {
    max: {
      Temperature: max(temperatures),
      Precipitation_rate: max(precipitations),
      Humidity: max(humidities),
    },
    min: {
      Temperature: min(temperatures),
      Precipitation_rate: min(precipitations),
      Humidity: min(humidities),
    },
    avg: {
      Temperature: avg(temperatures),
      Precipitation_rate: avg(precipitations),
      Humidity: avg(humidities),
    },
  };

  return result;
};
