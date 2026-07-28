import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  cancelAppointment,
  confirmAppointment,
  getAppointments,
  getAppointmentsCountByStatus,
  getTodaysAppointments,
  markAppointmentCompleted,
  markAppointmentNoShow,
  updateAppointment,
} from "@/api/appointment.api";
import type {
  AppointmentFilters,
  UpdateAppointmentData,
} from "@/interface/appointment.interface";

export const useAppointments = (filters?: AppointmentFilters) =>
  useQuery({
    queryKey: ["appointments", "list", filters],
    queryFn: () => getAppointments(filters),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useAppointmentStats = () =>
  useQuery({
    queryKey: ["appointments", "stats"],
    queryFn: getAppointmentsCountByStatus,
    staleTime: 60_000,
  });

export const useTodaysAppointments = () =>
  useQuery({
    queryKey: ["appointments", "today"],
    queryFn: getTodaysAppointments,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

export const useAppointmentActions = () => {
  const queryClient = useQueryClient();

  const refreshAppointments = () =>
    queryClient.invalidateQueries({ queryKey: ["appointments"] });

  const useActionMutation = <TVariables,>(
    mutationFn: (variables: TVariables) => Promise<unknown>,
    successMessage: string
  ) =>
    useMutation({
      mutationFn,
      onSuccess: async () => {
        toast.success(successMessage);
        await refreshAppointments();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });

  const confirmMutation = useActionMutation(
    confirmAppointment,
    "Appointment confirmed."
  );
  const cancelMutation = useActionMutation(
    cancelAppointment,
    "Appointment cancelled."
  );
  const completedMutation = useActionMutation(
    markAppointmentCompleted,
    "Appointment marked as completed."
  );
  const noShowMutation = useActionMutation(
    markAppointmentNoShow,
    "Appointment marked as no-show."
  );
  const updateMutation = useActionMutation(
    ({ id, data }: { id: number; data: UpdateAppointmentData }) =>
      updateAppointment(id, data),
    "Appointment updated."
  );

  return {
    confirmAppointment: confirmMutation.mutateAsync,
    cancelAppointment: cancelMutation.mutateAsync,
    markCompleted: completedMutation.mutateAsync,
    markNoShow: noShowMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    isLoading:
      confirmMutation.isPending ||
      cancelMutation.isPending ||
      completedMutation.isPending ||
      noShowMutation.isPending ||
      updateMutation.isPending,
  };
};
