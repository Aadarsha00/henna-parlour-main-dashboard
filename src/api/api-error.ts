import axios from "axios";

/**
 * DRF reports validation problems as {"field": ["message"]} rather than
 * {"detail": "..."}, so surface the first field message instead of falling
 * back to a generic string that tells the user nothing.
 */
const firstFieldError = (data: Record<string, unknown>): string | null => {
  for (const value of Object.values(data)) {
    if (typeof value === "string" && value) return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return null;
};

export const apiError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data) {
      const detail = data.detail ?? data.message;
      if (typeof detail === "string" && detail) return new Error(detail);

      const fieldError = firstFieldError(data);
      if (fieldError) return new Error(fieldError);
    }
  }
  return error instanceof Error ? error : new Error(fallback);
};
