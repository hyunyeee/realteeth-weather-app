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
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("daily", "temperature_2m_min,temperature_2m_max");
  url.searchParams.set("hourly", "temperature_2m");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Seoul");

  const data = await apiClient.get<WeatherForecastResponse>(url.toString());

  return {
    currentTemperature: data.current?.temperature_2m ?? null,
    minTemperature: data.daily?.temperature_2m_min?.[0] ?? null,
    maxTemperature: data.daily?.temperature_2m_max?.[0] ?? null,
    weatherCode: data.current?.weather_code ?? null,
    weatherDescription: getWeatherDescription(data.current?.weather_code),
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
    temperature: temperatures[index] ?? null,
  }));
}

function getWeatherDescription(weatherCode?: number) {
  if (weatherCode === undefined) {
    return "날씨 정보 준비 중";
  }

  if (weatherCode === 0) {
    return "맑음";
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return "구름 조금";
  }

  if ([45, 48].includes(weatherCode)) {
    return "안개";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "이슬비";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return "비";
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "눈";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "뇌우";
  }

  return "흐림";
}
