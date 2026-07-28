import { useMemo, useState } from "react";
import { Calendar, History, Search } from "lucide-react";

import type {
  Appointment,
  AppointmentListResponse,
} from "@/interface/appointment.interface";
import AppointmentSection from "./Section";

interface AppointmentTabsProps {
  appointments?: AppointmentListResponse;
  onEditAppointment: (appointment: Appointment) => void;
}

const businessDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const AppointmentTabs = ({
  appointments,
  onEditAppointment,
}: AppointmentTabsProps) => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const categorizedAppointments = useMemo(() => {
    const today = businessDate();
    const query = searchTerm.trim().toLowerCase();
    const matching = (appointments?.results ?? []).filter((appointment) => {
      if (!query) return true;
      return [
        appointment.client_name,
        appointment.client_email,
        appointment.client_phone,
        appointment.service_details.name,
      ].some((value) => value.toLowerCase().includes(query));
    });

    const upcoming: Appointment[] = [];
    const history: Appointment[] = [];

    matching.forEach((appointment) => {
      const isActive =
        appointment.status === "booked" ||
        appointment.status === "confirmed";
      if (
        isActive &&
        !appointment.is_past_due &&
        appointment.appointment_date !== today
      ) {
        upcoming.push(appointment);
      } else if (!isActive || appointment.is_past_due) {
        history.push(appointment);
      }
    });

    upcoming.sort(
      (left, right) =>
        left.appointment_date.localeCompare(right.appointment_date) ||
        left.appointment_time.localeCompare(right.appointment_time)
    );
    history.sort(
      (left, right) =>
        right.appointment_date.localeCompare(left.appointment_date) ||
        right.appointment_time.localeCompare(left.appointment_time)
    );

    return { upcoming, history };
  }, [appointments, searchTerm]);

  const tabs = [
    {
      key: "upcoming" as const,
      label: "Upcoming",
      icon: Calendar,
      appointments: categorizedAppointments.upcoming,
      emptyMessage: "No upcoming appointments scheduled.",
    },
    {
      key: "history" as const,
      label: "History",
      icon: History,
      appointments: categorizedAppointments.history,
      emptyMessage: "No appointment history found.",
    },
  ];

  const selectedTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          All appointments
        </h2>
        <label className="relative block max-w-md">
          <span className="sr-only">Search appointments</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search client, phone, email, or service"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="flex border-b border-gray-200" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex min-w-36 items-center justify-center gap-2 border-b-2 px-6 py-3 font-medium ${
                activeTab === tab.key
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.appointments.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-6" role="tabpanel">
        <AppointmentSection
          title={selectedTab.label}
          appointments={selectedTab.appointments}
          onEditAppointment={onEditAppointment}
          emptyMessage={
            searchTerm
              ? `No ${selectedTab.label.toLowerCase()} appointments match your search.`
              : selectedTab.emptyMessage
          }
        />
      </div>
    </div>
  );
};

export default AppointmentTabs;
