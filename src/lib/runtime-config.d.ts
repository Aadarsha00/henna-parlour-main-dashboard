export const DEFAULT_DEVELOPMENT_API_BASE_URL: string;
export const ADMIN_SESSION_STORAGE_KEY: string;

export function normalizeApiBaseUrl(value: string | undefined): string;
export function resolveApiBaseUrl(
  configuredValue: string | undefined,
  isDevelopment: boolean
): string;
export function parseDateOnlyLocal(value: string): Date;
