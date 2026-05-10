"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  MAX_FAVORITE_COUNT,
  useFavoriteStore,
  type FavoriteLocation,
} from "@/entities/favorite";
import { formatDistrictName, type District } from "@/entities/location";
import { useWeatherQuery } from "@/entities/weather";
import { useCurrentLocation } from "@/features/current-location";
import { useLocationSearch } from "@/features/location-search";
import { getLocationCoordinate, type LocationCoordinate } from "@/shared/api";
import { GlassCard, WeatherGlyph } from "@/shared/ui";

const DEFAULT_LOCATION = "서울특별시-종로구-청운동";
const DEFAULT_COORDINATE = {
  lat: 37.584,
  lon: 126.9707,
};

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const hourlyListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const hourlyItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function WeatherDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [isCurrentLocationSelected, setIsCurrentLocationSelected] =
    useState(false);
  const [hasSelectedLocationManually, setHasSelectedLocationManually] =
    useState(false);
  const [coordinate, setCoordinate] =
    useState<LocationCoordinate>(DEFAULT_COORDINATE);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const currentLocation = useCurrentLocation();
  const { keyword, setKeyword, results } = useLocationSearch();
  const weatherQuery = useWeatherQuery(coordinate);
  const favorites = useFavoriteStore((state) => state.favorites);
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const updateFavoriteAlias = useFavoriteStore(
    (state) => state.updateFavoriteAlias,
  );
  const isFavorite = useFavoriteStore((state) => state.isFavorite);

  const visibleResults = useMemo(() => results.slice(0, 8), [results]);
  const selectedLocationName = selectedLocation.replaceAll("-", " ");
  const canAddFavorite =
    !isCurrentLocationSelected &&
    !isFavorite(selectedLocation) && favorites.length < MAX_FAVORITE_COUNT;

  useEffect(() => {
    if (!currentLocation.coordinate || hasSelectedLocationManually) {
      return;
    }

    setCoordinate(currentLocation.coordinate);
    setSelectedLocation(currentLocation.location?.name ?? "현재 위치");
    setIsCurrentLocationSelected(true);
  }, [
    currentLocation.coordinate,
    currentLocation.location?.name,
    hasSelectedLocationManually,
  ]);

  const handleSelectLocation = async (district: District) => {
    const location = district.code;

    setKeyword("");
    setSelectedLocation(location);
    setIsCurrentLocationSelected(false);
    setHasSelectedLocationManually(true);
    setLocationError(null);
    setIsResolvingLocation(true);

    try {
      const nextCoordinate = await getLocationCoordinate(
        formatDistrictName(district),
      );

      setCoordinate(nextCoordinate);
    } catch {
      setLocationError("선택한 위치의 좌표를 찾지 못했어요.");
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleSelectFavorite = async (favorite: FavoriteLocation) => {
    setSelectedLocation(favorite.location);
    setIsCurrentLocationSelected(false);
    setHasSelectedLocationManually(true);
    setLocationError(null);
    setIsResolvingLocation(true);

    try {
      const nextCoordinate = await getLocationCoordinate(favorite.location);

      setCoordinate(nextCoordinate);
    } catch {
      setLocationError("즐겨찾기 위치의 좌표를 찾지 못했어요.");
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleAddFavorite = () => {
    addFavorite({ location: selectedLocation });
  };

  const handleUseCurrentLocation = () => {
    setHasSelectedLocationManually(false);
    setLocationError(null);
    currentLocation.requestCurrentLocation();
  };

  const handleEditAlias = (favorite: FavoriteLocation) => {
    const nextAlias = window.prompt("즐겨찾기 별칭", favorite.alias ?? "");

    if (nextAlias !== null) {
      updateFavoriteAlias(favorite.id, nextAlias);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(220,235,255,0.95),transparent_34%),linear-gradient(160deg,#b9dcff_0%,#aeb6ed_45%,#253158_100%)] px-4 py-5 text-white sm:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-lg flex-col gap-5"
      >
        <LocationSearch
          keyword={keyword}
          onKeywordChange={setKeyword}
          results={visibleResults}
          onSelectLocation={handleSelectLocation}
          isCurrentLocationLoading={currentLocation.isLoading}
          currentLocationError={currentLocation.error?.message ?? null}
          onUseCurrentLocation={handleUseCurrentLocation}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <CurrentWeatherCard
            locationName={selectedLocationName}
            isLoading={
              weatherQuery.isLoading ||
              isResolvingLocation ||
              currentLocation.isLoading
            }
            errorMessage={
              locationError ??
              (weatherQuery.isError ? "날씨 정보를 불러오지 못했어요." : null)
            }
            temperature={weatherQuery.data?.currentTemperature ?? null}
            description={weatherQuery.data?.weatherDescription ?? "현재 날씨"}
            weatherCode={weatherQuery.data?.weatherCode ?? null}
            minTemperature={weatherQuery.data?.minTemperature ?? null}
            maxTemperature={weatherQuery.data?.maxTemperature ?? null}
            canAddFavorite={canAddFavorite}
            onAddFavorite={handleAddFavorite}
          />
        </motion.div>

        <HourlyWeatherCard
          items={weatherQuery.data?.hourlyTemperatures ?? []}
          isLoading={weatherQuery.isLoading || isResolvingLocation}
        />

        <FavoriteGrid
          favorites={favorites}
          selectedLocation={selectedLocation}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={removeFavorite}
          onEditAlias={handleEditAlias}
        />
      </motion.div>
    </div>
  );
}

type LocationSearchProps = {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  results: District[];
  onSelectLocation: (district: District) => void;
  isCurrentLocationLoading: boolean;
  currentLocationError: string | null;
  onUseCurrentLocation: () => void;
};

function LocationSearch({
  keyword,
  onKeywordChange,
  results,
  onSelectLocation,
  isCurrentLocationLoading,
  currentLocationError,
  onUseCurrentLocation,
}: LocationSearchProps) {
  const isOpen = keyword.trim().length > 0;

  return (
    <div className="relative">
      <label htmlFor="location-search" className="sr-only">
        위치 검색
      </label>
      <input
        id="location-search"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="동네를 검색하세요"
        autoComplete="off"
        className="h-14 w-full rounded-3xl border border-white/25 bg-white/20 px-5 text-[15px] text-white shadow-[0_12px_36px_rgba(21,34,75,0.14)] outline-none backdrop-blur-2xl transition placeholder:text-white/65 focus:border-white/55 focus:bg-white/25"
      />

      <div className="mt-3 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isCurrentLocationLoading}
          aria-label="현재 위치 날씨 조회"
          className="h-10 rounded-full border border-white/20 bg-white/15 px-4 text-xs font-semibold text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/35 disabled:cursor-wait disabled:opacity-60"
        >
          {isCurrentLocationLoading ? "현재 위치 확인 중" : "현재 위치 사용"}
        </button>
        {currentLocationError ? (
          <p className="min-w-0 flex-1 truncate text-xs text-white/65">
            {currentLocationError}
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute left-0 right-0 top-28 z-20 max-h-72 overflow-y-auto rounded-3xl border border-white/25 bg-[#14234b]/70 p-2 shadow-2xl backdrop-blur-2xl"
          >
            {results.length > 0 ? (
              results.map((district) => (
                <button
                  key={district.code}
                  type="button"
                  onClick={() => onSelectLocation(district)}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white transition hover:bg-white/15 focus:bg-white/15 focus:outline-none"
                >
                  {district.name}
                </button>
              ))
            ) : (
              <p className="px-4 py-5 text-sm text-white/70">검색 결과가 없어요.</p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type CurrentWeatherCardProps = {
  locationName: string;
  isLoading: boolean;
  errorMessage: string | null;
  temperature: number | null;
  description: string;
  weatherCode: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  canAddFavorite: boolean;
  onAddFavorite: () => void;
};

function CurrentWeatherCard({
  locationName,
  isLoading,
  errorMessage,
  temperature,
  description,
  weatherCode,
  minTemperature,
  maxTemperature,
  canAddFavorite,
  onAddFavorite,
}: CurrentWeatherCardProps) {
  return (
    <GlassCard className="px-5 py-7 text-center sm:px-7">
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/40" />
      <p className="break-keep text-lg font-semibold leading-snug text-white">
        {locationName}
      </p>

      <div className="mt-5">
        {isLoading ? (
          <p className="py-8 text-base text-white/70">날씨를 불러오는 중이에요.</p>
        ) : errorMessage ? (
          <p className="py-8 text-base text-white/75">{errorMessage}</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="-mb-2 mt-1"
            >
              <WeatherGlyph code={weatherCode} />
            </motion.div>
            <p className="text-[88px] font-light leading-none tracking-normal text-white sm:text-8xl">
              {formatTemperature(temperature)}
            </p>
            <p className="mt-3 text-base font-medium text-white/80">
              {description}
            </p>
            <p className="mt-2 text-sm text-white/70">
              최저 {formatTemperature(minTemperature)} / 최고{" "}
              {formatTemperature(maxTemperature)}
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onAddFavorite}
        disabled={!canAddFavorite}
        aria-label="현재 위치를 즐겨찾기에 추가"
        className="mt-7 h-11 rounded-full border border-white/25 bg-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/45 disabled:cursor-not-allowed disabled:opacity-45"
      >
        즐겨찾기 추가
      </button>
    </GlassCard>
  );
}

type HourlyWeatherCardProps = {
  items: Array<{
    time: string;
    temperature: number | null;
  }>;
  isLoading: boolean;
};

function HourlyWeatherCard({ items, isLoading }: HourlyWeatherCardProps) {
  return (
    <GlassCard className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white/90">시간별 기온</h2>
        <span className="text-xs text-white/55">오늘</span>
      </div>

      {isLoading ? (
        <p className="px-1 py-8 text-sm text-white/65">시간별 예보를 준비 중이에요.</p>
      ) : items.length > 0 ? (
        <motion.div
          variants={hourlyListVariants}
          initial="hidden"
          animate="visible"
          className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <motion.div
              key={item.time}
              variants={hourlyItemVariants}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex min-w-16 flex-col items-center rounded-3xl border border-white/20 bg-white/12 px-3 py-4 text-center backdrop-blur-xl"
            >
              <span className="text-xs text-white/65">{formatHour(item.time)}</span>
              <span className="mt-4 text-xl font-semibold text-white">
                {formatTemperature(item.temperature)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="px-1 py-8 text-sm text-white/65">표시할 시간별 기온이 없어요.</p>
      )}
    </GlassCard>
  );
}

type FavoriteGridProps = {
  favorites: FavoriteLocation[];
  selectedLocation: string;
  onSelectFavorite: (favorite: FavoriteLocation) => void;
  onRemoveFavorite: (id: string) => void;
  onEditAlias: (favorite: FavoriteLocation) => void;
};

function FavoriteGrid({
  favorites,
  selectedLocation,
  onSelectFavorite,
  onRemoveFavorite,
  onEditAlias,
}: FavoriteGridProps) {
  return (
    <section className="pb-4">
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="text-sm font-semibold text-white/90">즐겨찾기 장소</h2>
        <span className="text-xs text-white/55">
          {favorites.length}/{MAX_FAVORITE_COUNT}
        </span>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((favorite) => {
            const isSelected = favorite.location === selectedLocation;

            return (
              <motion.article
                key={favorite.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`rounded-3xl border p-4 backdrop-blur-2xl ${
                  isSelected
                    ? "border-white/45 bg-white/25"
                    : "border-white/20 bg-white/12"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectFavorite(favorite)}
                  aria-label={`${favorite.alias ?? favorite.location} 날씨 보기`}
                  className="block w-full text-left focus:outline-none"
                >
                  <p className="truncate text-sm font-semibold text-white">
                    {favorite.alias ?? "내 장소"}
                  </p>
                  <p className="mt-2 line-clamp-2 min-h-10 break-keep text-xs leading-5 text-white/65">
                    {favorite.location.replaceAll("-", " ")}
                  </p>
                </button>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditAlias(favorite)}
                    className="h-8 flex-1 rounded-full bg-white/15 text-xs font-medium text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/35"
                  >
                    별칭
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(favorite.id)}
                    aria-label="즐겨찾기 삭제"
                    className="h-8 flex-1 rounded-full bg-white/10 text-xs font-medium text-white/80 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/35"
                  >
                    삭제
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <GlassCard className="px-5 py-8 text-center text-sm text-white/70">
          마음에 드는 위치를 즐겨찾기에 추가해보세요.
        </GlassCard>
      )}
    </section>
  );
}

function formatTemperature(temperature: number | null) {
  return temperature === null ? "--°" : `${Math.round(temperature)}°`;
}

function formatHour(time: string) {
  const [, hour = ""] = time.split("T");

  return hour.slice(0, 5);
}
