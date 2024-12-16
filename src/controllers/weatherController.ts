import { Request, Response } from "express";
import {
  getSummaryWeather,
  getWeatherForcasts,
} from "../services/weatherService";

export const getWeatherData = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (lon && lat) {
      const forecasts = await getWeatherForcasts(
        parseFloat(lat as string),
        parseFloat(lon as string)
      );

      if (forecasts.length === 0) {
        res
          .status(404)
          .send("No weather data found for this latitude, longitude");
      } else {
        res.json(forecasts);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve weather data." });
  }
};

export const getSummarizedData = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (lon && lat) {
      const forecasts = await getSummaryWeather(
        parseFloat(lat as string),
        parseFloat(lon as string)
      );

      if (!forecasts) {
        res
          .status(404)
          .send("No weather data found for this latitude, longitude");
      } else {
        res.json(forecasts);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve batches." });
  }
};
