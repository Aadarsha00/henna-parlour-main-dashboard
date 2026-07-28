import axios from "axios";
import api from "@/axios/api.axios";
import type {
  Appointment,
  AppointmentActionResponse,
  AppointmentAvailability,
  AppointmentCounts,
  AppointmentFilters,
  AppointmentListResponse,
  UpdateAppointmentData,
} from "@/interface/appointment.interface";

const apiError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const detail =
      data?.detail ||
      data?.message ||
      (typeof data === "object" && data
        ? Object.values(data).flat().join(" ")
        : undefined);
    return new Error(typeof detail === "string" && detail ? detail : fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
};

const appointmentParams = (filters?: AppointmentFilters) => {
  const params = new URLSearchParams();
  if (!filters) return params;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params;
};

const getAppointmentPage = async (
  url: string,
  filters?: AppointmentFilters
): Promise<AppointmentListResponse> => {
  const response = await api.get<AppointmentListResponse>(url, {
    params: url === "/appointments/" ? appointmentParams(filters) : undefined,
  });
  return response.data;
};

export const getAppointments = async (
  filters?: AppointmentFilters
): Promise<AppointmentListResponse> => {
  try {
    return await getAllAppointmentPages("/appointments/", filters);
  } catch (error) {
    throw apiError(error, "Failed to fetch appointments.");
  }
};

const getAllAppointmentPages = async (
  initialUrl: string,
  filters?: AppointmentFilters
): Promise<AppointmentListResponse> => {
  try {
    const firstPage = await getAppointmentPage(initialUrl, filters);
    const results = [...firstPage.results];
    let next = firstPage.next;
    const visited = new Set<string>();

    while (next && !visited.has(next)) {
      visited.add(next);
      const page = await getAppointmentPage(next);
      results.push(...page.results);
      next = page.next;
    }

    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  } catch (error) {
    throw apiError(error, "Failed to fetch appointments.");
  }
};

export const updateAppointment = async (
  appointmentId: number,
  updateData: UpdateAppointmentData
): Promise<Appointment> => {
  try {
    const response = await api.patch<Appointment>(
      `/appointments/${appointmentId}/`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update appointment.");
  }
};

const appointmentAction = async (
  appointmentId: number,
  action: string,
  fallback: string
): Promise<AppointmentActionResponse> => {
  try {
    const response = await api.post<AppointmentActionResponse>(
      `/appointments/${appointmentId}/${action}/`
    );
    return response.data;
  } catch (error) {
    throw apiError(error, fallback);
  }
};

export const cancelAppointment = (appointmentId: number) =>
  appointmentAction(
    appointmentId,
    "cancel",
    "Failed to cancel appointment."
  );

export const confirmAppointment = (appointmentId: number) =>
  appointmentAction(
    appointmentId,
    "confirm",
    "Failed to confirm appointment."
  );

export const markAppointmentCompleted = (appointmentId: number) =>
  appointmentAction(
    appointmentId,
    "mark_completed",
    "Failed to mark appointment as completed."
  );

export const markAppointmentNoShow = (appointmentId: number) =>
  appointmentAction(
    appointmentId,
    "mark_no_show",
    "Failed to mark appointment as no-show."
  );

export const getAppointmentAvailability = async (
  appointmentDate: string,
  serviceId: number
): Promise<AppointmentAvailability> => {
  try {
    const response = await api.get<AppointmentAvailability>(
      "/appointments/availability/",
      { params: { date: appointmentDate, service: serviceId } }
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load available times.");
  }
};

export const getAppointmentsByDateRange = (
  startDate: string,
  endDate: string
) =>
  getAppointments({
    appointment_date__gte: startDate,
    appointment_date__lte: endDate,
  });

export const getAppointmentsCountByStatus =
  async (): Promise<AppointmentCounts> => {
    const statuses = [
      "booked",
      "confirmed",
      "completed",
      "cancelled",
      "late_cancelled",
      "no_show",
    ] as const;

    const responses = await Promise.all(
      statuses.map(async (status) => {
        try {
          const response = await api.get<AppointmentListResponse>(
            "/appointments/",
            { params: { status } }
          );
          return response.data.count;
        } catch (error) {
          throw apiError(error, "Failed to fetch appointment counts.");
        }
      })
    );

    const counts = Object.fromEntries(
      statuses.map((status, index) => [status, responses[index]])
    ) as unknown as Omit<AppointmentCounts, "total">;

    return {
      ...counts,
      total: responses.reduce((sum, count) => sum + count, 0),
    };
  };

export const getTodaysAppointments = () =>
  getAllAppointmentPages("/appointments/today/");
