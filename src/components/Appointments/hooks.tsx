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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => getAppointments(filters),
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useAppointmentStats = () => {
  return useQuery({
    queryKey: ["appointment-stats"],
    queryFn: getAppointmentsCountByStatus,
    staleTime: 60000,
  });
};

export const useTodaysAppointments = () => {
  return useQuery({
    queryKey: ["todays-appointments"],
    queryFn: getTodaysAppointments,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

export const useAppointmentActions = () => {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: confirmAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["todays-appointments"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-stats"] });
    },
  });

  const completedMutation = useMutation({
    mutationFn: markAppointmentCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-stats"] });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: markAppointmentNoShow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentData }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    confirmAppointment: confirmMutation.mutate,
    cancelAppointment: cancelMutation.mutate,
    markCompleted: completedMutation.mutate,
    markNoShow: noShowMutation.mutate,
    updateAppointment: updateMutation.mutate,
    isLoading:
      confirmMutation.isPending ||
      cancelMutation.isPending ||
      completedMutation.isPending ||
      noShowMutation.isPending ||
      updateMutation.isPending,
  };
};
