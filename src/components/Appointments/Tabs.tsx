/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Search, Calendar, History } from "lucide-react";
import type { Appointment } from "@/interface/appointment.interface";
import AppointmentSection from "./Section";

interface AppointmentTabsProps {
  appointments: any;
  activeTab: "upcoming" | "past";
  onTabChange: (tab: "upcoming" | "past") => void;
  onEditAppointment: (appointment: Appointment) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
}

const AppointmentTabs = ({
  appointments,
  onEditAppointment,
}: AppointmentTabsProps) => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  const categorizedAppointments = useMemo(() => {
    if (!appointments?.results) return { upcoming: [], past: [] };

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];

    const filtered = appointments.results.filter((apt: Appointment) => {
      // Exclude today's appointments (they're handled separately)
      if (apt.appointment_date === todayDate) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !apt.client_name.toLowerCase().includes(searchLower) &&
          !apt.client_email.toLowerCase().includes(searchLower) &&
          !apt.service_details.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });

    const categorized = {
      upcoming: [] as Appointment[],
      past: [] as Appointment[],
    };

    filtered.forEach((apt: Appointment) => {
      if (apt.appointment_date > todayDate) {
        // Only show active appointments in upcoming (not cancelled, completed, or no_show)
        if (
          apt.status !== "cancelled" &&
          apt.status !== "completed" &&
          apt.status !== "no_show"
        ) {
          categorized.upcoming.push(apt);
        }
      } else {
        // Past appointments can include all statuses
        categorized.past.push(apt);
      }
    });

    // Sort upcoming appointments (earliest first)
    categorized.upcoming = categorized.upcoming.sort((a, b) => {
      const dateDiff = a.appointment_date.localeCompare(b.appointment_date);
      if (dateDiff !== 0) return dateDiff;
      return a.appointment_time.localeCompare(b.appointment_time);
    });

    // Sort past appointments (latest first)
    categorized.past = categorized.past.sort((a, b) => {
      const dateDiff = b.appointment_date.localeCompare(a.appointment_date);
      if (dateDiff !== 0) return dateDiff;
      return b.appointment_time.localeCompare(a.appointment_time);
    });

    return categorized;
  }, [appointments, searchTerm]);

  const tabs = [
    {
      key: "upcoming" as const,
      label: "Upcoming",
      icon: Calendar,
      count: categorizedAppointments.upcoming.length,
      appointments: categorizedAppointments.upcoming,
    },
    {
      key: "past" as const,
      label: "Past",
      icon: History,
      count: categorizedAppointments.past.length,
      appointments: categorizedAppointments.past,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Appointments
          </h2>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name, email, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Compact Tab Headers */}
      <div className="flex border-b border-gray-200">
        <div className="flex w-auto gap-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-8 py-3 font-medium transition-all duration-200 border-b-2 flex items-center gap-2 min-w-[140px] rounded-t-lg
                  ${
                    activeTab === tab.key
                      ? "text-blue-600 border-blue-500 bg-blue-50"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px]
                  ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.map(
          (tab) =>
            activeTab === tab.key && (
              <AppointmentSection
                key={tab.key}
                title={tab.label}
                appointments={tab.appointments}
                onEditAppointment={onEditAppointment}
                emptyMessage={
                  searchTerm
                    ? `No ${tab.key} appointments match your search`
                    : tab.key === "upcoming"
                    ? "No upcoming appointments scheduled"
                    : "No past appointments found"
                }
              />
            )
        )}
      </div>
    </div>
  );
};

export default AppointmentTabs;
