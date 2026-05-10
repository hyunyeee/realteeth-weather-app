import { geocodingApiBaseUrl } from "@/shared/config";
import { ApiError } from "./api-client";

type GeocodingApiResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ReverseGeocodingApiResponse = {
  display_name?: string;
  address?: {
    city?: string;
    state?: string;
    borough?: string;
    county?: string;
    city_district?: string;
    town?: string;
    village?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    name?: string;
  };
};

type NominatimSearchResponse = Array<{
  lat: string;
  lon: string;
}>;

export type LocationCoordinate = {
  lat: number;
  lon: number;
};

export type CurrentLocationAddress = {
  name: string;
  coordinate: LocationCoordinate;
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

  if (result) {
    return {
      lat: result.latitude,
      lon: result.longitude,
    };
  }

  return getNominatimLocationCoordinate(keyword, location);
}

export async function getCurrentLocationAddress(
  coordinate: LocationCoordinate,
): Promise<CurrentLocationAddress> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(coordinate.lat));
  url.searchParams.set("lon", String(coordinate.lon));
  url.searchParams.set("accept-language", "ko");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });
  const data = (await response.json()) as ReverseGeocodingApiResponse;

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch current location address: ${response.status}`,
      response.status,
      data,
    );
  }

  return {
    coordinate,
    name: formatCurrentLocationAddress(data) || formatCoordinate(coordinate),
  };
}

function normalizeLocationKeyword(location: string) {
  return location.replaceAll("-", " ").replace(/\s+/g, " ").trim();
}

async function getNominatimLocationCoordinate(
  keyword: string,
  originalLocation: string,
): Promise<LocationCoordinate> {
  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", keyword);
  url.searchParams.set("countrycodes", "kr");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "ko");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });
  const data = (await response.json()) as NominatimSearchResponse;

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch location coordinate: ${response.status}`,
      response.status,
      data,
    );
  }

  const [result] = data;

  if (!result) {
    throw new Error(`Location coordinate not found: ${originalLocation}`);
  }

  return {
    lat: Number(result.lat),
    lon: Number(result.lon),
  };
}

function formatCurrentLocationAddress(location: ReverseGeocodingApiResponse) {
  const addressParts = location.address;

  if (!addressParts) {
    return location.display_name?.split(",").slice(0, 3).join(" ").trim();
  }

  const address = [
    addressParts.state ?? addressParts.city,
    addressParts.borough ?? addressParts.county ?? addressParts.city_district,
    addressParts.town ??
      addressParts.village ??
      addressParts.suburb ??
      addressParts.quarter ??
      addressParts.neighbourhood,
  ]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(" ");

  return address || location.display_name?.split(",").slice(0, 3).join(" ").trim();
}

function formatCoordinate({ lat, lon }: LocationCoordinate) {
  return `현재 위치 ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}
