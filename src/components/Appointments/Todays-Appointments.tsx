/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Calendar, Filter } from "lucide-react";
import type { Appointment } from "@/interface/appointment.interface";
import { useTodaysAppointments } from "./hooks";
import AppointmentCard from "./Cards";

interface TodaysAppointmentsProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const TodaysAppointments = ({
  statusFilter,
  onStatusFilterChange,
  onEditAppointment,
}: TodaysAppointmentsProps) => {
  const { data: todaysData, isLoading } = useTodaysAppointments();

  const { filteredAppointments, statusCounts } = useMemo(() => {
    if (!todaysData?.results) {
      return { filteredAppointments: [], statusCounts: {} };
    }

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Count appointments by status
    const counts = todaysData.results.reduce((acc: any, apt: any) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Filter appointments - hide completed/cancelled unless specifically filtered
    const appointments = todaysData.results
      .filter((apt: Appointment) => {
        // If filtering for all, hide completed and cancelled appointments
        if (statusFilter === "all") {
          return (
            apt.status !== "completed" &&
            apt.status !== "cancelled" &&
            apt.status !== "no_show"
          );
        }
        // If specific status selected, show only that status
        return apt.status === statusFilter;
      })
      .map((apt: any) => {
        const enhanced = { ...apt };

        // Mark as new if booked today
        if (
          apt.created_at &&
          new Date(apt.created_at).toISOString().split("T")[0] === todayDate
        ) {
          enhanced.is_new = true;
        }

        // Mark as overdue if past appointment time and still pending/confirmed
        if (apt.status === "booked" || apt.status === "confirmed") {
          const [hours, minutes] = apt.appointment_time.split(":").map(Number);
          const appointmentTimeMinutes = hours * 60 + minutes;
          if (appointmentTimeMinutes < currentTime) {
            enhanced.needs_attention = true;
          }
        }

        return enhanced;
      });

    // Sort appointments by priority and time
    appointments.sort((a: any, b: any) => {
      // Priority 1: New bookings first
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;

      // Priority 2: Overdue appointments
      if (a.needs_attention && !b.needs_attention) return -1;
      if (!a.needs_attention && b.needs_attention) return 1;

      // Priority 3: Status urgency (booked > confirmed > others)
      const statusPriority = {
        booked: 1,
        confirmed: 2,
        completed: 3,
        cancelled: 4,
        no_show: 5,
      };
      const aPriority =
        statusPriority[a.status as keyof typeof statusPriority] || 6;
      const bPriority =
        statusPriority[b.status as keyof typeof statusPriority] || 6;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Priority 4: Sort by time
      return a.appointment_time.localeCompare(b.appointment_time);
    });

    return {
      filteredAppointments: appointments,
      statusCounts: counts,
    };
  }, [todaysData, statusFilter]);

  // Update active appointments count (excluding completed/cancelled/no_show)
  const activeAppointmentsCount =
    todaysData?.results?.filter(
      (apt: any) =>
        apt.status !== "completed" &&
        apt.status !== "cancelled" &&
        apt.status !== "no_show"
    ).length || 0;

  const quickFilters = [
    {
      key: "all",
      label: "Active",
      count: activeAppointmentsCount,
    },
    { key: "booked", label: "Pending", count: statusCounts.booked || 0 },
    {
      key: "confirmed",
      label: "Confirmed",
      count: statusCounts.confirmed || 0,
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed || 0,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: statusCounts.cancelled || 0,
    },
    { key: "no_show", label: "No Show", count: statusCounts.no_show || 0 },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Appointments
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredAppointments.length} showing)
            </span>
          </h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onStatusFilterChange(filter.key)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  statusFilter === filter.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              {filter.label}
              <span
                className={`
                ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold
                ${
                  statusFilter === filter.key
                    ? "bg-white bg-opacity-20 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {statusFilter === "all"
                ? "No active appointments for today"
                : `No ${statusFilter} appointments today`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment: Appointment) => (
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
