import axios from "axios";
import api from "@/axios/api.axios";
import type {
  Service,
  ServiceFormData,
  ServiceResponse,
} from "@/interface/Service.interface";

interface ServiceFilters {
  category?: string;
  search?: string;
  page?: number;
}

interface CategoryResponse {
  [key: string]: {
    name: string;
    services: Service[];
  };
}

const apiError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const detail = data?.detail || data?.message;
    return new Error(typeof detail === "string" && detail ? detail : fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
};

export const getServices = async (
  filters?: ServiceFilters
): Promise<ServiceResponse> => {
  try {
    const response = await api.get<ServiceResponse>("/services/", {
      params: {
        ...(filters?.category && filters.category !== "all"
          ? { category: filters.category }
          : {}),
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.page ? { page: filters.page } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to fetch services.");
  }
};

const servicePayload = (data: ServiceFormData) => ({
  ...data,
  price: Number.parseFloat(data.price),
  duration_minutes: Number(data.duration_minutes),
});

export const createService = async (
  serviceData: ServiceFormData
): Promise<Service> => {
  try {
    const response = await api.post<Service>(
      "/services/",
      servicePayload(serviceData)
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to create service.");
  }
};

export const getService = async (serviceId: number): Promise<Service> => {
  try {
    const response = await api.get<Service>(`/services/${serviceId}/`);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to fetch service details.");
  }
};

export const updateService = async (
  serviceId: number,
  serviceData: ServiceFormData
): Promise<Service> => {
  try {
    const response = await api.put<Service>(
      `/services/${serviceId}/`,
      servicePayload(serviceData)
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update service.");
  }
};

export const deleteService = async (serviceId: number): Promise<void> => {
  try {
    await api.delete(`/services/${serviceId}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete service.");
  }
};

export const getServiceCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get<CategoryResponse>("/services/by_category/");
    return Object.keys(response.data);
  } catch (error) {
    throw apiError(error, "Failed to fetch service categories.");
  }
};
