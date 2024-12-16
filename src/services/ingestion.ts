import pLimit from "p-limit";
import {
  BATCH_FORECAST_COLLECTION,
  CONCURRENCY,
  METADATA_BATCHES_COLLECTION,
} from "../config";
import { getDB } from "../database/mongoClient";
import {
  BatchMetadata,
  DataRow,
  ExternalBatch,
  PageResponse,
  Status,
} from "../models/types";
import { fetchPageData } from "../utils";

export async function createBatchMetadata(
  batch_id: string,
  forecast_time: Date
): Promise<void> {
  const db = getDB();
  const start_ingest_time = new Date();
  const metadata: BatchMetadata = {
    batch_id,
    forecast_time,
    number_of_rows: 0,
    start_ingest_time,
    end_ingest_time: null,
    status: Status.RUNNING,
  };
  await db.collection(METADATA_BATCHES_COLLECTION).insertOne(metadata);
}

export async function finalizeBatchMetadata(
  batch_id: string,
  number_of_rows: number,
  status: Status
): Promise<void> {
  const db = getDB();
  await db
    .collection(METADATA_BATCHES_COLLECTION)
    .updateOne(
      { batch_id },
      { $set: { number_of_rows, end_ingest_time: new Date(), status } }
    );
}

async function insertPageData(batchId: string, docs: DataRow[]): Promise<void> {
  if (!docs || docs.length === 0) return;
  const db = getDB();
  await db
    .collection(`${BATCH_FORECAST_COLLECTION}${batchId}`)
    .insertMany(docs, { ordered: false });
}

async function prepareBatchCollection(batchId: string): Promise<void> {
  const db = getDB();
  await db
    .createCollection(`${BATCH_FORECAST_COLLECTION}${batchId}`)
    .catch(() => {});
  await db
    .collection(`${BATCH_FORECAST_COLLECTION}${batchId}`)
    .createIndex({ latitude: 1, longitude: 1 });
}

export async function isBatchStillActiveExternally(
  batchId: string,
  currentExternalBatches: ExternalBatch[]
): Promise<boolean> {
  return currentExternalBatches.some((b) => b.batch_id === batchId);
}

async function enforceActiveLimit(): Promise<void> {
  const db = getDB();
  const activeBatches = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .find({ status: Status.ACTIVE })
    .sort({ forecast_time: 1 })
    .toArray();

  if (activeBatches.length > 3) {
    const extraBatches = activeBatches.slice(0, activeBatches.length - 3);

    for (const batch of extraBatches) {
      await db
        .collection(METADATA_BATCHES_COLLECTION)
        .updateOne(
          { batch_id: batch.batch_id },
          { $set: { status: Status.INACTIVE } }
        );
      console.log(`Deactivated batch ${batch.batch_id}.`);
    }
  }
}

async function enforceInactiveLimit(): Promise<void> {
  const db = getDB();
  const inactiveBatches = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .find({ status: Status.INACTIVE })
    .sort({ forecast_time: 1 })
    .toArray();

  const collections = await db.listCollections().toArray();
  const existingCollections = new Set(collections.map((c) => c.name));

  const inactiveWithData = inactiveBatches.filter((batch) =>
    existingCollections.has(`${BATCH_FORECAST_COLLECTION}${batch.batch_id}`)
  );

  if (inactiveWithData.length > 3) {
    const extraBatches = inactiveWithData.slice(0, inactiveWithData.length - 3);

    for (const batch of extraBatches) {
      try {
        await db
          .collection(`${BATCH_FORECAST_COLLECTION}${batch.batch_id}`)
          .drop();
        console.log(
          `Dropped data for batch ${batch.batch_id}, retaining metadata.`
        );
      } catch (err) {
        console.error(`Error dropping data for batch ${batch.batch_id}:`, err);
      }
    }
  }
}

export async function ingestBatch(
  batch_id: string,
  forecast_time: Date,
  currentExternalBatches: ExternalBatch[]
): Promise<void> {
  const db = getDB();

  const existingMeta = await db
    .collection(METADATA_BATCHES_COLLECTION)
    .findOne({ batch_id });
  if (!existingMeta) {
    await createBatchMetadata(batch_id, forecast_time);
  } else {
    if (
      existingMeta.status === Status.ACTIVE ||
      existingMeta.status === Status.INACTIVE
    ) {
      return;
    }
  }

  try {
    const firstPageData = await fetchPageData(batch_id, 0);
    const total_pages = firstPageData.metadata.total_pages;
    await prepareBatchCollection(batch_id);
    await insertPageData(batch_id, firstPageData.data);
    const limit = pLimit(CONCURRENCY);
    const tasks: Promise<number>[] = [];
    for (let page = 1; page < total_pages; page++) {
      tasks.push(
        limit(async () => {
          const pageData: PageResponse = await fetchPageData(batch_id, page);
          await insertPageData(batch_id, pageData.data);
          return pageData.data.length;
        })
      );
    }

    const results = await Promise.all(tasks);

    const totalInserted =
      firstPageData.data.length +
      results.reduce((sum, count) => sum + count, 0);

    const stillActive = await isBatchStillActiveExternally(
      batch_id,
      currentExternalBatches
    );
    const finalStatus = stillActive ? Status.ACTIVE : Status.INACTIVE;
    await finalizeBatchMetadata(batch_id, totalInserted, finalStatus);
    await enforceActiveLimit();
    await enforceInactiveLimit();
  } catch (e) {
    await finalizeBatchMetadata(batch_id, 0, Status.INACTIVE);
  }
}
