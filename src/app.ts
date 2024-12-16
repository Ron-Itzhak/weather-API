import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

import { closeDB, connectToDB } from "./database/mongoClient";
import batchesRoutes from "./routes/batchesRoutes";
import weatherRoutes from "./routes/weatherRoutes";

import "reflect-metadata";
import { PORT } from "./config";
dotenv.config();

const app: Express = express();
connectToDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Server Is running");
});

app.use(express.json());
app.use(cors());
app.use("/weather", weatherRoutes);
app.use("/batches", batchesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received.");
  closeDB();
  process.exit(0);
});
