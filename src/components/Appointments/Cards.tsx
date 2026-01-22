/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Appointment } from "@/interface/appointment.interface";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Edit3,
  Bell,
  Star,
} from "lucide-react";
import { useAppointmentActions } from "./hooks";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
}

const AppointmentCard = ({ appointment, onEdit }: AppointmentCardProps) => {
  const actions = useAppointmentActions();

  const getStatusBadge = (status: string) => {
    const styles = {
      booked: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      no_show: "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.booked
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          styles[paymentStatus as keyof typeof styles] || styles.pending
        }`}
      >
        {paymentStatus.toUpperCase()}
      </span>
    );
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if appointment is new (booked today) or needs attention
  const isNewAppointment = (appointment as any).is_new || false;
  const needsAttention = (appointment as any).needs_attention || false;

  return (
    <div
      className={`
      bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-300
      ${
        isNewAppointment
          ? "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-25 shadow-md ring-1 ring-blue-200 ring-opacity-50"
          : needsAttention
          ? "border-orange-400 bg-gradient-to-r from-orange-50 to-orange-25 shadow-md ring-1 ring-orange-200 ring-opacity-50"
          : "border-gray-200 hover:border-gray-300"
      }
    `}
    >
      {/* Priority Badges */}
      {isNewAppointment && (
        <div className="flex items-center mb-3 bg-blue-600 text-white px-2 py-1 rounded text-xs w-fit">
          <Star className="h-3 w-3 text-yellow-300 mr-1 fill-current" />
          <span className="font-bold">NEW TODAY</span>
          <Bell className="h-3 w-3 ml-1 animate-pulse" />
        </div>
      )}

      {needsAttention && !isNewAppointment && (
        <div className="flex items-center mb-3 bg-orange-600 text-white px-2 py-1 rounded text-xs w-fit">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span className="font-bold">OVERDUE</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        {/* Left Section - Client Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-bold text-lg text-gray-900">
                  {appointment.client_name}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 text-gray-400 mr-2" />
                  {appointment.client_email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 text-gray-400 mr-2" />
                  {appointment.client_phone}
                </div>
              </div>
            </div>

            {/* Status and Payment Badges */}
            <div className="flex flex-col items-end gap-1 ml-4">
              {getStatusBadge(appointment.status)}
              {getPaymentBadge(appointment.payment_status)}
            </div>
          </div>

          {/* Service and Time Info - Compact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-1 flex items-center text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                Service
              </h4>
              <p className="text-gray-800 font-medium text-sm">
                {appointment.service_details.name}
              </p>
              <p className="text-xs text-gray-600">
                {appointment.duration_minutes} min
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-1 flex items-center text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Date & Time
              </h4>
              <p className="text-gray-800 font-medium text-sm">
                {formatDate(appointment.appointment_date)}
              </p>
              <p className="text-xs text-gray-600">
                {formatTime(appointment.appointment_time)}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-1 flex items-center text-sm">
                <DollarSign className="h-3 w-3 mr-1" />
                Amount
              </h4>
              <p className="text-lg font-bold text-gray-900">
                ${appointment.total_amount}
              </p>
              {appointment.payment_summary.remaining_balance > 0 && (
                <p className="text-xs text-red-600 font-medium">
                  Balance: ${appointment.payment_summary.remaining_balance}
                </p>
              )}
            </div>
          </div>

          {/* Notes - Compact */}
          {appointment.notes && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-1 text-sm">Notes</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {appointment.status === "booked" && (
            <button
              onClick={() => actions.confirmAppointment(appointment.id)}
              disabled={actions.isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded hover:from-green-700 hover:to-green-800 transition-all duration-200 text-xs font-semibold shadow-sm"
              title="Confirm Appointment"
            >
              <CheckCircle className="h-3 w-3" />
              Confirm
            </button>
          )}

          {(appointment.status === "booked" ||
            appointment.status === "confirmed") && (
            <>
              <button
                onClick={() => actions.markCompleted(appointment.id)}
                disabled={actions.isLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs font-semibold shadow-sm"
                title="Mark Completed"
              >
                <CheckCircle className="h-3 w-3" />
                Complete
              </button>

              <button
                onClick={() => actions.markNoShow(appointment.id)}
                disabled={actions.isLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded hover:from-orange-700 hover:to-orange-800 transition-all duration-200 text-xs font-semibold shadow-sm"
                title="Mark No Show"
              >
                <AlertCircle className="h-3 w-3" />
                No Show
              </button>
            </>
          )}

          {appointment.can_cancel && (
            <button
              onClick={() => actions.cancelAppointment(appointment.id)}
              disabled={actions.isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs font-semibold shadow-sm"
              title="Cancel Appointment"
            >
              <XCircle className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>

        <button
          onClick={() => onEdit(appointment)}
          className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-xs font-semibold"
          title="Edit Appointment"
        >
          <Edit3 className="h-3 w-3" />
          Edit
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
