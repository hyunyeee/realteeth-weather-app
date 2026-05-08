import { geocodingApiBaseUrl } from "@/shared/config";
import { ApiError } from "./api-client";

type GeocodingApiResponse = {
  results?: Array<{
    latitude: number;
    longitude: number;
  }>;
};

export type LocationCoordinate = {
  lat: number;
  lon: number;
};

export async function getLocationCoordinate(
  location: string,
): Promise<LocationCoordinate> {
  const keyword = normalizeLocationKeyword(location);

  if (!keyword) {
    throw new Error("Location keyword is required.");
  }

  const url = new URL(`${geocodingApiBaseUrl}/search`);

  url.searchParams.set("name", keyword);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "ko");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });
  const data = (await response.json()) as GeocodingApiResponse;

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch location coordinate: ${response.status}`,
      response.status,
      data,
    );
  }

  const [result] = data.results ?? [];

  if (!result) {
    throw new Error(`Location coordinate not found: ${location}`);
  }

  return {
    lat: result.latitude,
    lon: result.longitude,
  };
}

function normalizeLocationKeyword(location: string) {
  return location.replaceAll("-", " ").replace(/\s+/g, " ").trim();
}
