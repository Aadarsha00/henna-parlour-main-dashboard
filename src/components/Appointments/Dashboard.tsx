import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import type {
  Appointment,
  AppointmentFilters,
} from "@/interface/appointment.interface";
import { useAppointments } from "./hooks";
import TodaysSummary from "./Todays-Summary";
import TodaysAppointments from "./Todays-Appointments";
import AppointmentTabs from "./Tabs";
import UpdateAppointmentModal from "./Update-Modal";

const AdminAppointmentsDashboard = () => {
  const [selectedFilters] = useState<AppointmentFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [todaysStatusFilter, setTodaysStatusFilter] = useState<string>("all");

  // Main data hook
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error,
  } = useAppointments(selectedFilters);

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowUpdateModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedAppointment(null);
  };

  if (appointmentsLoading && !appointmentsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-lg">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">
            Error loading appointments: {error.message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-display">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointments Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and monitor all salon appointments
          </p>
        </div>

        {/* Today's Summary - Key metrics at a glance */}
        <TodaysSummary />

        {/* Today's Appointments - Priority section */}
        <TodaysAppointments
          statusFilter={todaysStatusFilter}
          onStatusFilterChange={setTodaysStatusFilter}
          onEditAppointment={handleEditAppointment}
        />

        {/* All Appointments in Tabs - Secondary section */}
        <AppointmentTabs
          appointments={appointmentsData}
          activeTab="upcoming" // Default to upcoming instead of today since we have dedicated today section
          onTabChange={() => {}} // We'll manage this within the component
          onEditAppointment={handleEditAppointment}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter="all"
        />

        {/* Update Modal */}
        {showUpdateModal && selectedAppointment && (
          <UpdateAppointmentModal
            appointment={selectedAppointment}
            isOpen={showUpdateModal}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};
export default AdminAppointmentsDashboard;
