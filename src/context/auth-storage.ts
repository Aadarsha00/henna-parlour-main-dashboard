import { ADMIN_SESSION_STORAGE_KEY } from "@/lib/runtime-config.js";

export interface AdminSession {
  access: string;
  refresh: string;
}

const isAdminSession = (value: unknown): value is AdminSession => {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AdminSession>;
  return (
    typeof session.access === "string" &&
    Boolean(session.access) &&
    typeof session.refresh === "string" &&
    Boolean(session.refresh)
  );
};

export const readStoredSession = (): AdminSession | null => {
  const serializedSession = window.localStorage.getItem(
    ADMIN_SESSION_STORAGE_KEY
  );
  if (!serializedSession) return null;

  try {
    const session: unknown = JSON.parse(serializedSession);
    if (isAdminSession(session)) return session;
  } catch {
    // Invalid or legacy dashboard session data is discarded below.
  }

  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  return null;
};

export const writeStoredSession = (session: AdminSession) => {
  window.localStorage.setItem(
    ADMIN_SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
};

export const clearStoredSession = () => {
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
};
