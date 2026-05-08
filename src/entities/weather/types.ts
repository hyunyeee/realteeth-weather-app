export type WeatherCoordinate = {
  lat: number;
  lon: number;
};

export type HourlyTemperature = {
  time: string;
  temperature: number;
};

export type WeatherForecast = {
  currentTemperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  hourlyTemperatures: HourlyTemperature[];
};

export type WeatherForecastResponse = {
  current?: {
    temperature_2m?: number;
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
