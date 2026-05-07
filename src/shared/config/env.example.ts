import { apiClient } from "@/shared/api";
import { weatherApiBaseUrl } from "@/shared/config";

type WeatherForecastResponse = {
  latitude: number;
  longitude: number;
  current?: {
    temperature_2m: number;
  };
};

export function getWeatherForecast() {
  const url = new URL(`${weatherApiBaseUrl}/forecast`);

  url.searchParams.set("latitude", "37.5665");
  url.searchParams.set("longitude", "126.9780");
  url.searchParams.set("current", "temperature_2m");

  return apiClient.get<WeatherForecastResponse>(url.toString());
}
