import type {
  Appointment,
  UpdateAppointmentData,
} from "@/interface/appointment.interface";
import { useForm } from "react-hook-form";
import { useAppointmentActions } from "./hooks";

interface UpdateAppointmentModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

const UpdateAppointmentModal = ({
  appointment,
  isOpen,
  onClose,
}: UpdateAppointmentModalProps) => {
  const actions = useAppointmentActions();

  const updateForm = useForm<UpdateAppointmentData>({
    defaultValues: {
      appointment_date: appointment?.appointment_date || "",
      appointment_time: appointment?.appointment_time || "",
      notes: appointment?.notes || "",
    },
  });

  const handleUpdateSubmit = (data: UpdateAppointmentData) => {
    if (appointment) {
      actions.updateAppointment({ id: appointment.id, data });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Appointment</h3>

        <form
          onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              {...updateForm.register("appointment_date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              {...updateForm.register("appointment_time")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...updateForm.register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actions.isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actions.isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;
