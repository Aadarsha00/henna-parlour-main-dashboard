import api from "@/axios/api.axios";
import { apiError } from "./api-error";
import type {
  Paginated,
  SalonClosure,
  SalonClosureFormData,
} from "@/interface/admin.interface";

export const getClosures = async (
  page?: number
): Promise<Paginated<SalonClosure>> => {
  try {
    const response = await api.get<Paginated<SalonClosure>>(
      "/salon-closures/",
      { params: { ...(page ? { page } : {}) } }
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load salon closures.");
  }
};

export const createClosure = async (
  data: SalonClosureFormData
): Promise<SalonClosure> => {
  try {
    const response = await api.post<SalonClosure>("/salon-closures/", data);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to add the closure.");
  }
};

export const updateClosure = async (
  closureId: number,
  data: SalonClosureFormData
): Promise<SalonClosure> => {
  try {
    const response = await api.put<SalonClosure>(
      `/salon-closures/${closureId}/`,
      data
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update the closure.");
  }
};

export const deleteClosure = async (closureId: number): Promise<void> => {
  try {
    await api.delete(`/salon-closures/${closureId}/`);
  } catch (error) {
    throw apiError(error, "Failed to remove the closure.");
  }
};
