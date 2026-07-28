import { useMemo } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  UserX,
  XCircle,
} from "lucide-react";

import { useTodaysAppointments } from "./hooks";

const businessDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const TodaysSummary = () => {
  const { data: todaysData, isLoading } = useTodaysAppointments();

  const summary = useMemo(() => {
    const appointments = todaysData?.results ?? [];
    return {
      newBookings: appointments.filter(
        (appointment) =>
          ["booked", "confirmed"].includes(appointment.status) &&
          businessDate(new Date(appointment.created_at)) === businessDate()
      ).length,
      overdue: appointments.filter(
        (appointment) =>
          ["booked", "confirmed"].includes(appointment.status) &&
          appointment.is_past_due
      ).length,
      booked: appointments.filter(
        (appointment) => appointment.status === "booked"
      ).length,
      confirmed: appointments.filter(
        (appointment) => appointment.status === "confirmed"
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "completed"
      ).length,
      cancelled: appointments.filter((appointment) =>
        ["cancelled", "late_cancelled"].includes(appointment.status)
      ).length,
      noShow: appointments.filter(
        (appointment) => appointment.status === "no_show"
      ).length,
      total: appointments.length,
    };
  }, [todaysData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading today's summary…</span>
      </div>
    );
  }

  const cards = [
    {
      label: "New today",
      value: summary.newBookings,
      icon: Bell,
      colors: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      label: "Overdue",
      value: summary.overdue,
      icon: AlertCircle,
      colors: "border-orange-200 bg-orange-50 text-orange-700",
    },
    {
      label: "Pending",
      value: summary.booked,
      icon: Clock,
      colors: "border-yellow-200 bg-yellow-50 text-yellow-700",
    },
    {
      label: "Confirmed",
      value: summary.confirmed,
      icon: CheckCircle,
      colors: "border-green-200 bg-green-50 text-green-700",
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle,
      colors: "border-gray-200 bg-gray-50 text-gray-700",
    },
    {
      label: "Cancelled",
      value: summary.cancelled,
      icon: XCircle,
      colors: "border-red-200 bg-red-50 text-red-700",
    },
    {
      label: "No show",
      value: summary.noShow,
      icon: UserX,
      colors: "border-slate-200 bg-slate-50 text-slate-700",
    },
    {
      label: "Total",
      value: summary.total,
      icon: Calendar,
      colors: "border-purple-200 bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center text-xl font-semibold text-gray-900">
          <Calendar className="mr-2 h-5 w-5" />
          Today's overview
        </h2>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        {cards.map(({ label, value, icon: Icon, colors }) => (
          <div key={label} className={`rounded-lg border p-4 ${colors}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Icon className="h-5 w-5 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysSummary;
