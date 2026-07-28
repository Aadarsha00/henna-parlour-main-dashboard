export const DEFAULT_DEVELOPMENT_API_BASE_URL = "http://localhost:8000/api";
export const ADMIN_SESSION_STORAGE_KEY = "bbh_admin_session_v1";

export const normalizeApiBaseUrl = (value) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    throw new Error("The API base URL is required.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    throw new Error("The API base URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("The API base URL must use HTTP or HTTPS.");
  }

  return trimmedValue.replace(/\/+$/, "");
};

export const resolveApiBaseUrl = (configuredValue, isDevelopment) => {
  const rawValue =
    configuredValue?.trim() ||
    (isDevelopment ? DEFAULT_DEVELOPMENT_API_BASE_URL : "");

  if (!rawValue) {
    throw new Error(
      "VITE_API_BASE_URL is required for production dashboard builds."
    );
  }

  const normalizedValue = normalizeApiBaseUrl(rawValue);
  if (!isDevelopment && new URL(normalizedValue).protocol !== "https:") {
    throw new Error("Production VITE_API_BASE_URL must use HTTPS.");
  }

  return normalizedValue;
};

export const parseDateOnlyLocal = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("Date-only values must use YYYY-MM-DD.");
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;
  const day = Number(dayValue);
  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    throw new Error("Date-only value is not a valid calendar date.");
  }

  return date;
};
