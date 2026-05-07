"use client";

import { useEffect, useMemo, useState } from "react";
import { searchDistricts } from "@/entities/location";

const LOCATION_SEARCH_DEBOUNCE_MS = 300;

export function useLocationSearch(initialKeyword = "") {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, LOCATION_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [keyword]);

  const results = useMemo(
    () => searchDistricts(debouncedKeyword),
    [debouncedKeyword],
  );

  return {
    keyword,
    setKeyword,
    debouncedKeyword,
    results,
  };
}
