/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTodaysAppointments } from "./hooks";

const TodaysSummary = () => {
  const { data: todaysData, isLoading } = useTodaysAppointments();

  const summaryStats = useMemo(() => {
    if (!todaysData?.results) return null;

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let newBookings = 0;
    let pendingConfirmation = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let noShow = 0;
    let overdue = 0;

    todaysData.results.forEach((apt: any) => {
      // Check if appointment was booked today
      if (
        apt.created_at &&
        new Date(apt.created_at).toISOString().split("T")[0] === todayDate
      ) {
        newBookings++;
      }

      // Count by status
      switch (apt.status) {
        case "booked":
          pendingConfirmation++;
          break;
        case "confirmed":
          confirmed++;
          break;
        case "completed":
          completed++;
          break;
        case "cancelled":
          cancelled++;
          break;
        case "no_show":
          noShow++;
          break;
      }

      // Check if overdue (past appointment time and still booked/confirmed)
      if (apt.status === "booked" || apt.status === "confirmed") {
        const [hours, minutes] = apt.appointment_time.split(":").map(Number);
        const appointmentTimeMinutes = hours * 60 + minutes;
        if (appointmentTimeMinutes < currentTime) {
          overdue++;
        }
      }
    });

    return {
      newBookings,
      pendingConfirmation,
      confirmed,
      completed,
      cancelled,
      noShow,
      overdue,
      total: todaysData.results.length,
    };
  }, [todaysData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2">Loading today's summary...</span>
        </div>
      </div>
    );
  }

  if (!summaryStats) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Today's Overview
        </h2>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* New Bookings - Highest Priority */}
        <div
          className={`p-4 rounded-lg border-2 ${
            summaryStats.newBookings > 0
              ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                NEW TODAY
              </p>
              <p
                className={`text-2xl font-bold ${
                  summaryStats.newBookings > 0
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {summaryStats.newBookings}
              </p>
            </div>
            <Bell
              className={`h-5 w-5 ${
                summaryStats.newBookings > 0 ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </div>
          {summaryStats.newBookings > 0 && (
            <p className="text-xs text-blue-600 font-medium mt-1">
              Needs attention
            </p>
          )}
        </div>

        {/* Overdue Appointments */}
        <div
          className={`p-4 rounded-lg border-2 ${
            summaryStats.overdue > 0
              ? "bg-orange-50 border-orange-200 ring-2 ring-orange-100"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">OVERDUE</p>
              <p
                className={`text-2xl font-bold ${
                  summaryStats.overdue > 0 ? "text-orange-600" : "text-gray-400"
                }`}
              >
                {summaryStats.overdue}
              </p>
            </div>
            <AlertCircle
              className={`h-5 w-5 ${
                summaryStats.overdue > 0 ? "text-orange-600" : "text-gray-400"
              }`}
            />
          </div>
          {summaryStats.overdue > 0 && (
            <p className="text-xs text-orange-600 font-medium mt-1">
              Past due time
            </p>
          )}
        </div>

        {/* Pending Confirmation */}
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">PENDING</p>
              <p className="text-2xl font-bold text-yellow-600">
                {summaryStats.pendingConfirmation}
              </p>
            </div>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        {/* Confirmed */}
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                CONFIRMED
              </p>
              <p className="text-2xl font-bold text-green-600">
                {summaryStats.confirmed}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                COMPLETED
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {summaryStats.completed}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Cancelled */}
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                CANCELLED
              </p>
              <p className="text-2xl font-bold text-red-600">
                {summaryStats.cancelled}
              </p>
            </div>
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>

        {/* Total Today */}
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">TOTAL</p>
              <p className="text-2xl font-bold text-purple-600">
                {summaryStats.total}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysSummary;
