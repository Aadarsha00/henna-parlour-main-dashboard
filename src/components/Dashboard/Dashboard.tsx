import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  eachDayOfInterval,
  format,
  isAfter,
  parseISO,
  subDays,
} from "date-fns";

import {
  getAppointmentsByDateRange,
  getAppointmentsCountByStatus,
  getTodaysAppointments,
} from "@/api/appointment.api";
import { getServices } from "@/api/services.api";
import type {
  Appointment,
  AppointmentStatus,
} from "@/interface/appointment.interface";

const statusStyles: Record<AppointmentStatus, string> = {
  booked: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  late_cancelled: "bg-orange-100 text-orange-800",
  no_show: "bg-gray-100 text-gray-800",
};

const humanize = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 13), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const rangeIsValid =
    Boolean(dateRange.start && dateRange.end) &&
    !isAfter(parseISO(dateRange.start), parseISO(dateRange.end));

  const {
    data: appointmentCounts,
    isLoading: countsLoading,
    error: countsError,
  } = useQuery({
    queryKey: ["appointments", "stats"],
    queryFn: getAppointmentsCountByStatus,
    refetchInterval: 30_000,
  });

  const {
    data: todaysAppointments,
    isLoading: todayLoading,
    error: todayError,
  } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: getTodaysAppointments,
    refetchInterval: 60_000,
  });

  const { data: appointmentsTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["appointments", "trend", dateRange.start, dateRange.end],
    queryFn: () =>
      getAppointmentsByDateRange(dateRange.start, dateRange.end),
    enabled: rangeIsValid,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
    staleTime: 600_000,
  });

  const statusChartData = appointmentCounts
    ? [
        { name: "Booked", value: appointmentCounts.booked, color: "#EAB308" },
        {
          name: "Confirmed",
          value: appointmentCounts.confirmed,
          color: "#3B82F6",
        },
        {
          name: "Completed",
          value: appointmentCounts.completed,
          color: "#10B981",
        },
        {
          name: "Cancelled",
          value: appointmentCounts.cancelled,
          color: "#EF4444",
        },
        {
          name: "Late cancelled",
          value: appointmentCounts.late_cancelled,
          color: "#F97316",
        },
        { name: "No show", value: appointmentCounts.no_show, color: "#6B7280" },
      ].filter((item) => item.value > 0)
    : [];

  const appointmentsTrendData = useMemo(() => {
    if (!appointmentsTrend || !rangeIsValid) return [];
    const totals = appointmentsTrend.results.reduce<Record<string, number>>(
      (accumulator, appointment) => {
        accumulator[appointment.appointment_date] =
          (accumulator[appointment.appointment_date] ?? 0) + 1;
        return accumulator;
      },
      {}
    );

    return eachDayOfInterval({
      start: parseISO(dateRange.start),
      end: parseISO(dateRange.end),
    }).map((date) => {
      const key = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM d"),
        appointments: totals[key] ?? 0,
      };
    });
  }, [appointmentsTrend, dateRange.end, dateRange.start, rangeIsValid]);

  const servicesByCategory = useMemo(() => {
    if (!servicesData) return [];
    const totals = servicesData.results.reduce<Record<string, number>>(
      (accumulator, service) => {
        accumulator[service.category] =
          (accumulator[service.category] ?? 0) + 1;
        return accumulator;
      },
      {}
    );
    return Object.entries(totals).map(([category, count]) => ({
      name: humanize(category),
      value: count,
    }));
  }, [servicesData]);

  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-display lg:p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Booking activity and service availability at a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshDashboard}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total appointments"
          value={appointmentCounts?.total ?? 0}
          loading={countsLoading}
          icon={<Calendar className="h-8 w-8 text-blue-600" />}
        />
        <StatCard
          label="Today's appointments"
          value={todaysAppointments?.count ?? 0}
          loading={todayLoading}
          icon={<Clock className="h-8 w-8 text-green-600" />}
        />
        <StatCard
          label="Awaiting confirmation"
          value={appointmentCounts?.booked ?? 0}
          loading={countsLoading}
          icon={<AlertCircle className="h-8 w-8 text-yellow-600" />}
        />
        <StatCard
          label="Total services"
          value={servicesData?.count ?? 0}
          loading={servicesLoading}
          icon={<Briefcase className="h-8 w-8 text-purple-600" />}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Appointment status">
          {countsError ? (
            <ChartMessage
              icon={<AlertCircle className="h-8 w-8" />}
              text="Failed to load appointment totals."
            />
          ) : countsLoading ? (
            <ChartLoader />
          ) : statusChartData.length === 0 ? (
            <ChartMessage
              icon={<CheckCircle className="h-8 w-8" />}
              text="No appointment data available."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="70%"
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Services by category">
          {servicesLoading ? (
            <ChartLoader />
          ) : servicesByCategory.length === 0 ? (
            <ChartMessage
              icon={<Briefcase className="h-8 w-8" />}
              text="No services available."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Appointment trend
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm text-gray-600">
              <span className="sr-only">Trend start date</span>
              <input
                type="date"
                value={dateRange.start}
                max={dateRange.end}
                onChange={(event) =>
                  setDateRange((current) => ({
                    ...current,
                    start: event.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
              />
            </label>
            <span className="hidden text-gray-500 sm:inline">to</span>
            <label className="text-sm text-gray-600">
              <span className="sr-only">Trend end date</span>
              <input
                type="date"
                value={dateRange.end}
                min={dateRange.start}
                onChange={(event) =>
                  setDateRange((current) => ({
                    ...current,
                    end: event.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
              />
            </label>
          </div>
        </div>
        {!rangeIsValid ? (
          <p className="flex h-64 items-center justify-center text-red-600">
            The start date must be on or before the end date.
          </p>
        ) : trendLoading ? (
          <ChartLoader />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentsTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.35}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's appointments
          </h2>
        </div>
        <div className="p-4 lg:p-6">
          {todayLoading ? (
            <ChartLoader />
          ) : todayError ? (
            <ChartMessage
              icon={<AlertCircle className="h-6 w-6" />}
              text="Failed to load today's appointments."
            />
          ) : todaysAppointments?.results.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Client", "Service", "Time", "Duration", "Status"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {todaysAppointments.results.map(
                    (appointment: Appointment) => (
                      <tr key={appointment.id}>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.client_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.client_phone}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {appointment.service_details.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {new Date(
                            `2000-01-01T${appointment.appointment_time}`
                          ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {appointment.duration_minutes} min
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              statusStyles[appointment.status]
                            }`}
                          >
                            {humanize(appointment.status)}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <ChartMessage
              icon={<Calendar className="h-8 w-8" />}
              text="No appointments scheduled for today."
            />
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <div className="mt-1 text-2xl font-bold text-gray-900">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
        </div>
      </div>
      {icon}
    </div>
  </div>
);

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
    <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
    <div className="h-64">{children}</div>
  </div>
);

const ChartLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
  </div>
);

const ChartMessage = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 text-center text-gray-500">
    {icon}
    <p>{text}</p>
  </div>
);

export default DashboardPage;
