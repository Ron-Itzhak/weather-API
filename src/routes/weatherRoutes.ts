import express from "express";
import {
  getSummarizedData,
  getWeatherData,
} from "../controllers/weatherController";
import { validateDto } from "../middlewares/validationMiddleware";
import { GetWeatherDataQueryDto } from "../models/dto/weather.dto";

const router = express.Router();

router.get("/data", validateDto(GetWeatherDataQueryDto), getWeatherData);
router.get(
  "/summarize",
  validateDto(GetWeatherDataQueryDto),
  getSummarizedData
);

export default router;
