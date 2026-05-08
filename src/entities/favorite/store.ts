"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FAVORITE_STORAGE_KEY, MAX_FAVORITE_COUNT } from "@/entities";
import type {
  AddFavoriteLocationPayload,
  FavoriteLocation,
} from "./types";

type FavoriteState = {
  favorites: FavoriteLocation[];
  addFavorite: (payload: AddFavoriteLocationPayload) => boolean;
  removeFavorite: (id: string) => void;
  updateFavoriteAlias: (id: string, alias: string) => void;
  isFavorite: (location: string) => boolean;
};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: ({ location, alias }) => {
        const normalizedLocation = normalizeLocation(location);

        if (!normalizedLocation) {
          return false;
        }

        const { favorites } = get();
        const exists = favorites.some(
          (favorite) => normalizeLocation(favorite.location) === normalizedLocation,
        );

        if (exists || favorites.length >= MAX_FAVORITE_COUNT) {
          return false;
        }

        set({
          favorites: [
            ...favorites,
            {
              id: createFavoriteId(normalizedLocation),
              location: normalizedLocation,
              alias: normalizeAlias(alias),
            },
          ],
        });

        return true;
      },

      removeFavorite: (id) => {
        set(({ favorites }) => ({
          favorites: favorites.filter((favorite) => favorite.id !== id),
        }));
      },

      updateFavoriteAlias: (id, alias) => {
        set(({ favorites }) => ({
          favorites: favorites.map((favorite) =>
            favorite.id === id
              ? { ...favorite, alias: normalizeAlias(alias) }
              : favorite,
          ),
        }));
      },

      isFavorite: (location) => {
        const normalizedLocation = normalizeLocation(location);

        return get().favorites.some(
          (favorite) => normalizeLocation(favorite.location) === normalizedLocation,
        );
      },
    }),
    {
      name: FAVORITE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

function normalizeLocation(location: string) {
  return location.trim();
}

function normalizeAlias(alias?: string) {
  const normalizedAlias = alias?.trim();

  return normalizedAlias || undefined;
}

function createFavoriteId(location: string) {
  return encodeURIComponent(location);
}
