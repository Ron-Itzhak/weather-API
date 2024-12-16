import express from "express";
import {
  getBatches,
  getIngestionBatches,
} from "../controllers/batchesController";

const router = express.Router();

router.get("/", getBatches);
router.get("/ingest", getIngestionBatches);

export default router;
