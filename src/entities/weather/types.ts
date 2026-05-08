export type WeatherCoordinate = {
  lat: number;
  lon: number;
};

export type HourlyTemperature = {
  time: string;
  temperature: number | null;
};

export type WeatherForecast = {
  currentTemperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  weatherCode: number | null;
  weatherDescription: string;
  hourlyTemperatures: HourlyTemperature[];
};

export type WeatherForecastResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
  };
};
