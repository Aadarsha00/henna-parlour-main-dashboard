import { useMemo } from "react";
import { AlertCircle, Calendar, Filter } from "lucide-react";

import type {
  Appointment,
  AppointmentStatus,
} from "@/interface/appointment.interface";
import { useTodaysAppointments } from "./hooks";
import AppointmentCard from "./Cards";

type TodayFilter = "all" | AppointmentStatus;

interface TodaysAppointmentsProps {
  statusFilter: TodayFilter;
  onStatusFilterChange: (status: TodayFilter) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const businessDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const statuses: AppointmentStatus[] = [
  "booked",
  "confirmed",
  "completed",
  "cancelled",
  "late_cancelled",
  "no_show",
];

const TodaysAppointments = ({
  statusFilter,
  onStatusFilterChange,
  onEditAppointment,
}: TodaysAppointmentsProps) => {
  const { data: todaysData, isLoading, error } = useTodaysAppointments();

  const { filteredAppointments, statusCounts, activeCount } = useMemo(() => {
    const counts = Object.fromEntries(
      statuses.map((status) => [status, 0])
    ) as Record<AppointmentStatus, number>;

    const enhanced = (todaysData?.results ?? []).map((appointment) => {
      counts[appointment.status] += 1;
      const isActive =
        appointment.status === "booked" ||
        appointment.status === "confirmed";
      return {
        ...appointment,
        is_new:
          isActive &&
          Boolean(appointment.created_at) &&
          businessDate(new Date(appointment.created_at)) === businessDate(),
        needs_attention: isActive && appointment.is_past_due,
      };
    });

    const active = enhanced.filter(
      (appointment) =>
        appointment.status === "booked" ||
        appointment.status === "confirmed"
    );
    const filtered =
      statusFilter === "all"
        ? active
        : enhanced.filter(
            (appointment) => appointment.status === statusFilter
          );

    filtered.sort((left, right) => {
      if (left.needs_attention !== right.needs_attention) {
        return left.needs_attention ? -1 : 1;
      }
      if (left.is_new !== right.is_new) return left.is_new ? -1 : 1;
      return left.appointment_time.localeCompare(right.appointment_time);
    });

    return {
      filteredAppointments: filtered,
      statusCounts: counts,
      activeCount: active.length,
    };
  }, [statusFilter, todaysData]);

  const quickFilters: Array<{
    key: TodayFilter;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "Active", count: activeCount },
    { key: "booked", label: "Pending", count: statusCounts.booked },
    {
      key: "confirmed",
      label: "Confirmed",
      count: statusCounts.confirmed,
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: statusCounts.cancelled,
    },
    {
      key: "late_cancelled",
      label: "Late cancelled",
      count: statusCounts.late_cancelled,
    },
    { key: "no_show", label: "No show", count: statusCounts.no_show },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <AlertCircle className="h-5 w-5" />
        {error.message}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center text-xl font-semibold text-gray-900">
            <Calendar className="mr-2 h-5 w-5" />
            Today's appointments
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredAppointments.length} shown)
            </span>
          </h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="border-b border-gray-100 bg-gray-50 p-4">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onStatusFilterChange(filter.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                statusFilter === filter.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
              <span className="ml-2 rounded-full bg-black/10 px-1.5 py-0.5 text-xs font-bold">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">
              {statusFilter === "all"
                ? "No active appointments for today."
                : `No ${statusFilter.replaceAll("_", " ")} appointments today.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={onEditAppointment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysAppointments;
