import type { Appointment } from "@/interface/appointment.interface";
import { Calendar } from "lucide-react";
import AppointmentCard from "./Cards";

interface AppointmentSectionProps {
  title: string;
  appointments: Appointment[];
  onEditAppointment: (appointment: Appointment) => void;
  emptyMessage: string;
}

const AppointmentSection = ({
  appointments,
  onEditAppointment,
  emptyMessage,
}: AppointmentSectionProps) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onEdit={onEditAppointment}
        />
      ))}
    </div>
  );
};

export default AppointmentSection;
