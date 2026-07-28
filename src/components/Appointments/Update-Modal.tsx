import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Loader2, X } from "lucide-react";

import { getAppointmentAvailability } from "@/api/appointment.api";
import type {
  Appointment,
  UpdateAppointmentData,
} from "@/interface/appointment.interface";
import { useAppointmentActions } from "./hooks";

interface UpdateAppointmentModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (time: string) =>
  new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const UpdateAppointmentModal = ({
  appointment,
  isOpen,
  onClose,
}: UpdateAppointmentModalProps) => {
  const actions = useAppointmentActions();
  const canReschedule =
    (appointment.status === "booked" ||
      appointment.status === "confirmed") &&
    !appointment.is_past_due;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateAppointmentData>({
    defaultValues: {
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes ?? "",
    });
  }, [appointment, reset]);

  const selectedDate = watch("appointment_date") ?? "";

  const {
    data: availability,
    isLoading: availabilityLoading,
    error: availabilityError,
  } = useQuery({
    queryKey: [
      "appointments",
      "availability",
      selectedDate,
      appointment.service,
    ],
    queryFn: () =>
      getAppointmentAvailability(selectedDate, appointment.service),
    enabled: isOpen && canReschedule && Boolean(selectedDate),
  });

  const availableSlots = useMemo(() => {
    const slots = [...(availability?.slots ?? [])];
    if (
      selectedDate === appointment.appointment_date &&
      !slots.some((slot) => slot.value === appointment.appointment_time)
    ) {
      slots.push({
        value: appointment.appointment_time,
        label: formatTime(appointment.appointment_time),
      });
    }
    return slots.sort((left, right) => left.value.localeCompare(right.value));
  }, [
    appointment.appointment_date,
    appointment.appointment_time,
    availability,
    selectedDate,
  ]);

  const submitUpdate = async (data: UpdateAppointmentData) => {
    const payload: UpdateAppointmentData = { notes: data.notes ?? "" };
    if (canReschedule) {
      payload.appointment_date = data.appointment_date;
      payload.appointment_time = data.appointment_time;
    }

    try {
      await actions.updateAppointment({ id: appointment.id, data: payload });
      onClose();
    } catch {
      // The mutation displays the API error and keeps the form open.
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-appointment-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="update-appointment-title"
            className="text-lg font-semibold text-gray-900"
          >
            Update appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close appointment editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!canReschedule && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            This appointment cannot be rescheduled. Notes can still be updated.
          </p>
        )}

        <form onSubmit={handleSubmit(submitUpdate)} className="space-y-4">
          <div>
            <label
              htmlFor="appointment-date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              id="appointment-date"
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              max={format(addDays(new Date(), 90), "yyyy-MM-dd")}
              disabled={!canReschedule}
              {...register("appointment_date", {
                required: canReschedule ? "Choose an appointment date." : false,
                onChange: () => setValue("appointment_time", ""),
              })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
            />
            {errors.appointment_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.appointment_date.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="appointment-time"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Available time
            </label>
            <div className="relative">
              <select
                id="appointment-time"
                disabled={!canReschedule || availabilityLoading}
                {...register("appointment_time", {
                  required: canReschedule
                    ? "Choose an available appointment time."
                    : false,
                })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {availabilityLoading
                    ? "Loading available times…"
                    : "Choose an available time"}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {availabilityLoading && (
                <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
              )}
            </div>
            {availabilityError && (
              <p className="mt-1 text-sm text-red-600">
                {availabilityError.message}
              </p>
            )}
            {!availabilityLoading &&
              !availabilityError &&
              canReschedule &&
              availableSlots.length === 0 && (
                <p className="mt-1 text-sm text-amber-700">
                  No times remain available on this date.
                </p>
              )}
            {errors.appointment_time && (
              <p className="mt-1 text-sm text-red-600">
                {errors.appointment_time.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="appointment-notes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="appointment-notes"
              {...register("notes", { maxLength: 2000 })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actions.isLoading || availabilityLoading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actions.isLoading ? "Updating…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;
