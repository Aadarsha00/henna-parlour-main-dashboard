import api from "@/axios/api.axios";
import { apiError } from "./api-error";
import type {
  Paginated,
  Promotion,
  PromotionFormData,
} from "@/interface/admin.interface";

export interface PromotionFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
}

const promotionPayload = (data: PromotionFormData) => ({
  title: data.title,
  description: data.description,
  // The API expects null, not "", when only one discount type is used.
  discount_percentage: data.discount_percentage
    ? Number.parseFloat(data.discount_percentage)
    : null,
  discount_amount: data.discount_amount
    ? Number.parseFloat(data.discount_amount)
    : null,
  start_date: data.start_date,
  end_date: data.end_date,
  is_active: data.is_active,
  applicable_services: data.applicable_services,
  terms_conditions: data.terms_conditions,
});

export const getPromotions = async (
  filters?: PromotionFilters
): Promise<Paginated<Promotion>> => {
  try {
    const response = await api.get<Paginated<Promotion>>("/promotions/", {
      params: {
        ...(filters?.is_active !== undefined
          ? { is_active: filters.is_active }
          : {}),
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.page ? { page: filters.page } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load promotions.");
  }
};

export const createPromotion = async (
  data: PromotionFormData
): Promise<Promotion> => {
  try {
    const response = await api.post<Promotion>(
      "/promotions/",
      promotionPayload(data)
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to create promotion.");
  }
};

export const updatePromotion = async (
  promotionId: number,
  data: PromotionFormData
): Promise<Promotion> => {
  try {
    const response = await api.put<Promotion>(
      `/promotions/${promotionId}/`,
      promotionPayload(data)
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update promotion.");
  }
};

export const togglePromotionActive = async (
  promotionId: number
): Promise<Promotion> => {
  try {
    const response = await api.post<Promotion>(
      `/promotions/${promotionId}/toggle_active/`
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to change promotion status.");
  }
};

export const deletePromotion = async (promotionId: number): Promise<void> => {
  try {
    await api.delete(`/promotions/${promotionId}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete promotion.");
  }
};
