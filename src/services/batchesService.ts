import { Db } from "mongodb";
import { METADATA_BATCHES_COLLECTION } from "../config";
import { getDB } from "../database/mongoClient";
import { ingestBatch } from "./ingestion";
import { fetchAllBatches } from "../utils";
import { Status } from "../models/types";

export const getBatchesMeta = async () => {
  const db: Db = await getDB();
  const activeBatches = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .find()
    .toArray();
  return activeBatches;
};

export const ingestBatches = async () => {
  const db = await getDB();
  await db.createCollection(METADATA_BATCHES_COLLECTION).catch(() => {});
  await db.collection(METADATA_BATCHES_COLLECTION).createIndex({ status: 1 });

  const currentExternalBatches = await fetchAllBatches();
  for (const batch of currentExternalBatches) {
    const existing = await db
      .collection(METADATA_BATCHES_COLLECTION)
      .findOne({ batch_id: batch.batch_id });
    if (!existing || existing.status === Status.RUNNING) {
      const forecastTime = new Date(batch.forecast_time);
      await ingestBatch(batch.batch_id, forecastTime, currentExternalBatches);
    }
  }
};
