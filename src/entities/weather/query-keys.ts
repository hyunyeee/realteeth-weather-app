import type { WeatherCoordinate } from "./types";

export const weatherQueryKeys = {
  all: ["weather"] as const,
  forecasts: () => [...weatherQueryKeys.all, "forecast"] as const,
  forecast: ({ lat, lon }: WeatherCoordinate) =>
    [...weatherQueryKeys.forecasts(), { lat, lon }] as const,
};
