import { ObjectId } from "mongodb";

export interface PageMetadata {
  batch_id: string;
  count: number;
  total_pages: number;
  page: number;
  total_items: number;
}

export interface DataRow {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  precipitation_rate: number;
}
export interface PageResponse {
  metadata: PageMetadata;
  data: DataRow[];
}

export interface BatchMetadata {
  _id?: ObjectId;
  batch_id: string;
  forecast_time: Date;
  number_of_rows: number;
  start_ingest_time: Date;
  end_ingest_time: Date | null;
  status: Status;
}

export interface ExternalBatch {
  batch_id: string;
  forecast_time: string;
}

export enum Status {
  RUNNING = "RUNNING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface ForecastItem {
  forecastTime: string;
  temperature: number;
  precipitation_rate: number;
  humidity: number;
}
export interface SummarizeItem {
  max: Record<string, number>;
  min: Record<string, number>;
  avg: Record<string, number>;
}
