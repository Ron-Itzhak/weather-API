import { Request, Response } from "express";
import { getBatchesMeta, ingestBatches } from "../services/batchesService";

export const getBatches = async (req: Request, res: Response) => {
  try {
    const batches = await getBatchesMeta();
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve batches." });
  }
};

export const getIngestionBatches = async (req: Request, res: Response) => {
  try {
    await ingestBatches();
    res.status(200).send("Ingestion Complete");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to ingest batches" });
  }
};
