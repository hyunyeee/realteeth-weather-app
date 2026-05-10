"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCurrentLocationAddress,
  type CurrentLocationAddress,
  type LocationCoordinate,
} from "@/shared/api";

type CurrentLocationStatus = "idle" | "loading" | "success" | "error";

type CurrentLocationErrorCode =
  | "unsupported"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unknown";

type CurrentLocationError = {
  code: CurrentLocationErrorCode;
  message: string;
};

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 5 * 60 * 1000,
};

export function useCurrentLocation() {
  const [location, setLocation] = useState<CurrentLocationAddress | null>(null);
  const [status, setStatus] = useState<CurrentLocationStatus>("idle");
  const [error, setError] = useState<CurrentLocationError | null>(null);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError({
        code: "unsupported",
        message: "이 브라우저에서는 현재 위치를 사용할 수 없어요.",
      });
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinate = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        try {
          const currentLocationAddress =
            await getCurrentLocationAddress(coordinate);

          setLocation(currentLocationAddress);
        } catch {
          setLocation({
            coordinate,
            name: formatCoordinate(coordinate),
          });
        } finally {
          setStatus("success");
        }
      },
      (geolocationError) => {
        setStatus("error");
        setError(getCurrentLocationError(geolocationError));
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  return {
    coordinate: location?.coordinate ?? null,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    location,
    requestCurrentLocation,
    status,
  };
}

function getCurrentLocationError(
  error: GeolocationPositionError,
): CurrentLocationError {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      code: "permission-denied",
      message: "현재 위치 권한이 허용되지 않았어요.",
    };
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      code: "unavailable",
      message: "현재 위치를 확인할 수 없어요.",
    };
  }

  if (error.code === error.TIMEOUT) {
    return {
      code: "timeout",
      message: "현재 위치 확인 시간이 초과됐어요.",
    };
  }

  return {
    code: "unknown",
    message: "현재 위치를 가져오지 못했어요.",
  };
}

function formatCoordinate({ lat, lon }: LocationCoordinate) {
  return `현재 위치 ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}
