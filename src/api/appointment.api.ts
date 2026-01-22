/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentListResponse,
  AppointmentResponse,
  CreateAppointmentData,
  PaymentSummary,
  UpdateAppointmentData,
} from "@/interface/appointment.interface";

// List appointments with optional filters
export const getAppointments = async (filters?: AppointmentFilters) => {
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.payment_status)
      params.append("payment_status", filters.payment_status);
    if (filters?.appointment_date)
      params.append("appointment_date", filters.appointment_date);
    if (filters?.service) params.append("service", filters.service.toString());
    if (filters?.stylist) params.append("stylist", filters.stylist.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/appointments/?${queryString}`
      : "/appointments/";

    const response = await api.get<AppointmentListResponse>(url);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to fetch appointments";
  }
};

// Create new appointment
export const createAppointment = async (
  appointmentData: CreateAppointmentData
) => {
  try {
    const response = await api.post<Appointment>(
      "/appointments/",
      appointmentData
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to create appointment";
  }
};

// Get appointment details by ID
export const getAppointmentById = async (appointmentId: number) => {
  try {
    const response = await api.get<Appointment>(
      `/appointments/${appointmentId}/`
    );
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message || "Failed to fetch appointment details"
    );
  }
};

// Update appointment
export const updateAppointment = async (
  appointmentId: number,
  updateData: UpdateAppointmentData
) => {
  try {
    const response = await api.put<Appointment>(
      `/appointments/${appointmentId}/`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to update appointment";
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId: number) => {
  try {
    const response = await api.post<AppointmentResponse>(
      `/appointments/${appointmentId}/cancel/`
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to cancel appointment";
  }
};

// Confirm appointment (Admin only)
export const confirmAppointment = async (appointmentId: number) => {
  try {
    const response = await api.post<AppointmentResponse>(
      `/appointments/${appointmentId}/confirm/`
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to confirm appointment";
  }
};

// Mark appointment as completed (Admin only)
export const markAppointmentCompleted = async (appointmentId: number) => {
  try {
    const response = await api.post<AppointmentResponse>(
      `/appointments/${appointmentId}/mark_completed/`
    );
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message ||
      "Failed to mark appointment as completed"
    );
  }
};

// Mark appointment as no show (Admin only)
export const markAppointmentNoShow = async (appointmentId: number) => {
  try {
    const response = await api.post<AppointmentResponse>(
      `/appointments/${appointmentId}/mark_no_show/`
    );
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message || "Failed to mark appointment as no show"
    );
  }
};

// Get payment summary for appointment
export const getAppointmentPaymentSummary = async (appointmentId: number) => {
  try {
    const response = await api.get<PaymentSummary>(
      `/appointments/${appointmentId}/payment_summary/`
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to fetch payment summary";
  }
};

// Check payment status for appointment
export const checkAppointmentPaymentStatus = async (appointmentId: number) => {
  try {
    const response = await api.get<{
      payment_status: string;
      is_fully_paid: boolean;
      remaining_balance: number;
      next_payment_due?: string;
    }>(`/appointments/${appointmentId}/check_payment_status/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to check payment status";
  }
};

// Get user's upcoming appointments (requires authentication)
export const getMyUpcomingAppointments = async () => {
  try {
    const response = await api.get<Appointment[]>("/appointments/my_upcoming/");
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message || "Failed to fetch upcoming appointments"
    );
  }
};

// Get appointments with pending payments
export const getPaymentPendingAppointments = async () => {
  try {
    const response = await api.get<Appointment[]>(
      "/appointments/payment_pending/"
    );
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message ||
      "Failed to fetch payment pending appointments"
    );
  }
};

// Bulk operations for admin dashboard

// Get appointments by date range
export const getAppointmentsByDateRange = async (
  startDate: string,
  endDate: string,
  filters?: Omit<AppointmentFilters, "appointment_date">
) => {
  try {
    const params = new URLSearchParams();
    params.append("appointment_date__gte", startDate);
    params.append("appointment_date__lte", endDate);

    if (filters?.status) params.append("status", filters.status);
    if (filters?.payment_status)
      params.append("payment_status", filters.payment_status);
    if (filters?.service) params.append("service", filters.service.toString());
    if (filters?.stylist) params.append("stylist", filters.stylist.toString());

    const response = await api.get<AppointmentListResponse>(
      `/appointments/?${params.toString()}`
    );
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message ||
      "Failed to fetch appointments by date range"
    );
  }
};

// Get appointments count by status
export const getAppointmentsCountByStatus = async () => {
  try {
    const [booked, confirmed, completed, cancelled, noShow] = await Promise.all(
      [
        getAppointments({ status: "booked" }),
        getAppointments({ status: "confirmed" }),
        getAppointments({ status: "completed" }),
        getAppointments({ status: "cancelled" }),
        getAppointments({ status: "no_show" }),
      ]
    );

    return {
      booked: booked.count,
      confirmed: confirmed.count,
      completed: completed.count,
      cancelled: cancelled.count,
      no_show: noShow.count,
      total:
        booked.count +
        confirmed.count +
        completed.count +
        cancelled.count +
        noShow.count,
    };
  } catch (error: any) {
    throw (
      error?.response?.data?.message || "Failed to fetch appointment counts"
    );
  }
};

// Get today's appointments
export const getTodaysAppointments = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await getAppointments({ appointment_date: today });
    return response;
  } catch (error: any) {
    throw (
      error?.response?.data?.message || "Failed to fetch today's appointments"
    );
  }
};

// Search appointments by client name or email
export const searchAppointments = async (searchTerm: string) => {
  try {
    const params = new URLSearchParams();
    params.append("search", searchTerm);

    const response = await api.get<AppointmentListResponse>(
      `/appointments/?${params.toString()}`
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data?.message || "Failed to search appointments";
  }
};
