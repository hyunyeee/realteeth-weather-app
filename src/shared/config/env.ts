export const env = {
  weatherApiBaseUrl: process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL,
  geocodingApiBaseUrl: process.env.NEXT_PUBLIC_GEOCODING_API_BASE_URL,
} as const;

type PublicEnvKey = keyof typeof env;

export function getPublicEnv(key: PublicEnvKey) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const weatherApiBaseUrl = getPublicEnv("weatherApiBaseUrl");
export const geocodingApiBaseUrl = getPublicEnv("geocodingApiBaseUrl");
