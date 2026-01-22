/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

// Import your API functions
import {
  getAppointmentsCountByStatus,
  getTodaysAppointments,
  getAppointmentsByDateRange,
  getPaymentPendingAppointments,
} from "@/api/appointment.api";
import { getServices } from "@/api/services.api";

const DashboardPage = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch appointment counts by status
  const {
    data: appointmentCounts,
    isLoading: countsLoading,
    error: countsError,
  } = useQuery({
    queryKey: ["appointmentCounts"],
    queryFn: () => getAppointmentsCountByStatus(),
    refetchInterval: 30000,
  });

  // Fetch today's appointments
  const {
    data: todaysAppointments,
    isLoading: todayLoading,
    error: todayError,
  } = useQuery({
    queryKey: ["todaysAppointments"],
    queryFn: () => getTodaysAppointments(),
    refetchInterval: 60000,
  });

  // Fetch appointments by date range for trend analysis
  const { data: appointmentsTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["appointmentsTrend", dateRange.start, dateRange.end],
    queryFn: () => getAppointmentsByDateRange(dateRange.start, dateRange.end),
    enabled: !!dateRange.start && !!dateRange.end,
  });

  // Fetch payment pending appointments
  const { data: paymentPending, isLoading: paymentLoading } = useQuery({
    queryKey: ["paymentPending"],
    queryFn: () => getPaymentPendingAppointments(),
    refetchInterval: 300000,
  });

  // Fetch services data
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
    staleTime: 600000,
  });

  // Process data for charts - Fixed overlapping issue for pie chart
  const statusChartData = appointmentCounts
    ? [
        { name: "Booked", value: appointmentCounts.booked, color: "#3B82F6" },
        {
          name: "Confirmed",
          value: appointmentCounts.confirmed,
          color: "#10B981",
        },
        {
          name: "Completed",
          value: appointmentCounts.completed,
          color: "#059669",
        },
        {
          name: "Cancelled",
          value: appointmentCounts.cancelled,
          color: "#EF4444",
        },
        { name: "No Show", value: appointmentCounts.no_show, color: "#F59E0B" },
      ].filter((item) => item.value > 0)
    : [];

  // Process appointments trend data
  const processAppointmentsTrend = () => {
    if (!appointmentsTrend?.results) return [];

    const grouped = appointmentsTrend.results.reduce(
      (acc: Record<string, number>, appointment: any) => {
        const date = new Date(appointment.appointment_date).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(grouped)
      .map(([date, count]) => ({
        date,
        appointments: count,
      }))
      .slice(-14);
  };

  // Process services by category
  const processServicesByCategory = () => {
    if (!servicesData?.results) return [];

    const categories = servicesData.results.reduce(
      (acc: Record<string, number>, service: any) => {
        acc[service.category] = (acc[service.category] || 0) + 1;
        return acc;
      },
      {}
    );

    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

    return Object.entries(categories).map(([category, count], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: colors[index % colors.length],
    }));
  };

  // Custom label function for pie chart
  const renderPieLabel = ({
    name,
    percent,
  }: {
    name: string;
    percent?: number;
  }) => {
    if (percent === undefined) return name;
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-display">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Dashboard</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening at your Parlour today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {countsLoading ? (
                    <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin" />
                  ) : (
                    appointmentCounts?.total || 0
                  )}
                </p>
              </div>
              <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Today's Appointments
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {todayLoading ? (
                    <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin" />
                  ) : (
                    todaysAppointments?.count || 0
                  )}
                </p>
              </div>
              <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Payment Pending
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {paymentLoading ? (
                    <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin" />
                  ) : (
                    paymentPending?.length || 0
                  )}
                </p>
              </div>
              <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Total Services
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {servicesLoading ? (
                    <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin" />
                  ) : (
                    servicesData?.count || 0
                  )}
                </p>
              </div>
              <Briefcase className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Appointment Status Distribution */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              Appointment Status
            </h3>
            {countsLoading ? (
              <div className="flex items-center justify-center h-48 lg:h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : countsError ? (
              <div className="flex items-center justify-center h-48 lg:h-64 text-red-500">
                <AlertCircle className="h-8 w-8 mr-2" />
                <span className="text-sm lg:text-base">
                  Failed to load data
                </span>
              </div>
            ) : statusChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 lg:h-64 text-gray-500">
                <div className="text-center">
                  <CheckCircle className="h-8 lg:h-12 w-8 lg:w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm lg:text-base">
                    No appointment data available
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius="60%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Services by Category */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
              Services by Category
            </h3>
            {servicesLoading ? (
              <div className="flex items-center justify-center h-48 lg:h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="h-48 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processServicesByCategory()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Appointments Trend */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                Appointments Trend (Last 14 Days)
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-2 lg:px-3 py-1 text-xs lg:text-sm w-full sm:w-auto"
                />
                <span className="text-gray-500 text-xs lg:text-sm hidden sm:inline">
                  to
                </span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-2 lg:px-3 py-1 text-xs lg:text-sm w-full sm:w-auto"
                />
              </div>
            </div>
            {trendLoading ? (
              <div className="flex items-center justify-center h-48 lg:h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="h-48 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processAppointmentsTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Today's Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
              Today's Appointments
            </h3>
          </div>
          <div className="p-4 lg:p-6">
            {todayLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : todayError ? (
              <div className="flex items-center justify-center py-8 text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span className="text-sm lg:text-base">
                  Failed to load today's appointments
                </span>
              </div>
            ) : todaysAppointments?.results &&
              todaysAppointments.results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Service
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todaysAppointments.results.map((appointment: any) => (
                      <tr key={appointment.id}>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.client_name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {appointment.service_details.name || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {appointment.service_details.name || "N/A"}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.appointment_time ||
                            new Date(
                              appointment.appointment_date
                            ).toLocaleTimeString()}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "booked"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <div className="mt-1 md:hidden">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.payment_status === "pending"
                                  ? "bg-red-100 text-red-800"
                                  : appointment.payment_status === "refunded"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {appointment.payment_status || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : appointment.payment_status === "pending"
                                ? "bg-red-100 text-red-800"
                                : appointment.payment_status === "refunded"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {appointment.payment_status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 lg:h-12 w-8 lg:w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm lg:text-base">
                  No appointments scheduled for today
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
