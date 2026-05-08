"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeatherForecast } from "./api";
import { weatherQueryKeys } from "./query-keys";
import type { WeatherCoordinate } from "./types";

export function useWeatherQuery(coordinate?: WeatherCoordinate | null) {
  const isEnabled =
    coordinate !== undefined &&
    coordinate !== null &&
    Number.isFinite(coordinate.lat) &&
    Number.isFinite(coordinate.lon);

  return useQuery({
    queryKey: isEnabled
      ? weatherQueryKeys.forecast(coordinate)
      : weatherQueryKeys.forecasts(),
    queryFn: () => getWeatherForecast(coordinate as WeatherCoordinate),
    enabled: isEnabled,
  });
}
