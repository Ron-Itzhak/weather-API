import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class GetWeatherDataQueryDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}
