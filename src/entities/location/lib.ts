import koreaDistricts from "./korea_districts.json";
import type { District } from "./types";

const DISTRICT_SEPARATOR = "-";

export const districts = koreaDistricts.map(parseDistrict);

export function parseDistrict(value: string): District {
  const [province, city, town] = value
    .split(DISTRICT_SEPARATOR)
    .map((part) => part.trim());

  if (!province) {
    throw new Error("District province is required.");
  }

  return {
    province,
    city,
    town,
    code: [province, city, town].filter(Boolean).join(DISTRICT_SEPARATOR),
    name: formatDistrictName({ province, city, town }),
  };
}

export function searchDistricts(keyword: string): District[] {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return [];
  }

  return districts.filter((district) =>
    normalizeKeyword(district.name).includes(normalizedKeyword),
  );
}

export function formatDistrictName(
  district: Pick<District, "province" | "city" | "town">,
): string {
  return [district.province, district.city, district.town]
    .filter(Boolean)
    .join(" ");
}

function normalizeKeyword(value: string) {
  return value.replaceAll(DISTRICT_SEPARATOR, " ").replace(/\s+/g, "").trim();
}
