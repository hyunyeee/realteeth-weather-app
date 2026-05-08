import { apiClient } from "@/shared/api";
import { weatherApiBaseUrl } from "@/shared/config";
import type {
  HourlyTemperature,
  WeatherCoordinate,
  WeatherForecast,
  WeatherForecastResponse,
} from "./types";

export async function getWeatherForecast({
  lat,
  lon,
}: WeatherCoordinate): Promise<WeatherForecast> {
  const url = new URL(`${weatherApiBaseUrl}/forecast`);

  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("daily", "temperature_2m_min,temperature_2m_max");
  url.searchParams.set("hourly", "temperature_2m");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Seoul");

  const data = await apiClient.get<WeatherForecastResponse>(url.toString());

  return {
    currentTemperature: data.current?.temperature_2m ?? null,
    minTemperature: data.daily?.temperature_2m_min?.[0] ?? null,
    maxTemperature: data.daily?.temperature_2m_max?.[0] ?? null,
    hourlyTemperatures: mapHourlyTemperatures(data),
  };
}

function mapHourlyTemperatures(
  data: WeatherForecastResponse,
): HourlyTemperature[] {
  const times = data.hourly?.time ?? [];
  const temperatures = data.hourly?.temperature_2m ?? [];

  return times.map((time, index) => ({
    time,
    temperature: temperatures[index] ?? 0,
  }));
}
