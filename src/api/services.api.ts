/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/axios/api.axios";
import type {
  Service,
  ServiceFormData,
  ServiceResponse,
} from "@/interface/Service.interface";

interface ServiceFilters {
  category?: string;
  search?: string;
}

export const getServices = async (
  filters?: ServiceFilters
): Promise<ServiceResponse> => {
  try {
    const params = new URLSearchParams();

    // Only add category if defined and NOT "all"
    if (filters?.category && filters.category !== "all") {
      params.append("category", filters.category);
    }

    // Add search parameter if provided
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get(`/services/${queryString}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch services"
    );
  }
};

// Create Service (Admin)
export const createService = async (
  serviceData: ServiceFormData
): Promise<Service> => {
  try {
    // Ensure numeric fields are numbers
    const formattedData = {
      ...serviceData,
      price: parseFloat(String(serviceData.price)),
      duration_minutes: parseInt(String(serviceData.duration_minutes)),
      deposit_amount: parseFloat(String(serviceData.deposit_amount || 0)),
    };
    
    const response = await api.post("/services/", formattedData);
    return response.data;
  } catch (error: any) {
    console.error("Service creation error:", error.response?.data);
    throw new Error(
      error?.response?.data?.message || error?.response?.data?.detail || "Failed to create service"
    );
  }
};

// Get Service Details - GET /services/{id}/
export const getService = async (serviceId: number): Promise<Service> => {
  try {
    const response = await api.get(`/services/${serviceId}/`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch service details"
    );
  }
};

// Update Service (Admin) - PUT /services/{id}/
export const updateService = async (
  serviceId: number,
  serviceData: Partial<ServiceFormData>
): Promise<Service> => {
  try {
    const response = await api.put(`/services/${serviceId}/`, serviceData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update service"
    );
  }
};

// Partial Update Service (Admin) - PATCH /services/{id}/
export const patchService = async (
  serviceId: number,
  serviceData: Partial<ServiceFormData>
): Promise<Service> => {
  try {
    const response = await api.patch(`/services/${serviceId}/`, serviceData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to patch service"
    );
  }
};

// Delete Service (Admin) - DELETE /services/{id}/
export const deleteService = async (serviceId: number): Promise<any> => {
  try {
    const response = await api.delete(`/services/${serviceId}/`);
    return (
      response.data || {
        success: true,
        message: "Service deleted successfully",
      }
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete service"
    );
  }
};

// Get Services by Category - GET /services/by_category/
export const getServicesByCategory = async (): Promise<any> => {
  try {
    const response = await api.get("/services/by_category/");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch services by category"
    );
  }
};

// Get all unique service categories
export const getServiceCategories = async (): Promise<string[]> => {
  try {
    // Only include categories that exist in the backend
    const defaultCategories = ["hair", "lashes", "threading", "party"];
    
    let allServices: any[] = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch all pages using page parameter with increased page size
    while (hasMore) {
      const response = await api.get("/services/", { params: { page, page_size: 100 } });
      const results = Array.isArray(response.data.results)
        ? response.data.results
        : Array.isArray(response.data)
        ? response.data
        : [];
      
      console.log(`Fetched page ${page} with results:`, results.length, "Total so far:", allServices.length + results.length);
      
      if (results.length === 0) {
        hasMore = false;
        break;
      }
      
      allServices = [...allServices, ...results];
      
      // Check if there's a next page
      if (response.data.next) {
        page++;
      } else {
        hasMore = false;
      }
    }

    // Extract categories from existing services
    const existingCategories = allServices
      .map((service: any) => service.category)
      .filter(
        (category: any): category is string =>
          typeof category === "string" && category.trim() !== ""
      );

    // Combine default categories with any custom ones from services
    const allCategories = [...new Set<string>([...defaultCategories, ...existingCategories])].sort();
    
    console.log("Found categories:", allCategories, "from", allServices.length, "services");
    
    return allCategories;
  } catch (error: any) {
    console.error("Error fetching service categories:", error);
    // Return default categories if API call fails
    return ["hair", "lashes", "threading", "party"];
  }
};

// Convenience functions for common use cases

// Get services by specific category
export const getServicesBySpecificCategory = async (
  category: string
): Promise<ServiceResponse> => {
  try {
    return await getServices({ category, search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch services by specific category"
    );
  }
};

// Get all hair services
export const getHairServices = async (): Promise<ServiceResponse> => {
  try {
    return await getServices({ category: "hair", search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch hair services"
    );
  }
};

// Get all eyebrow services
export const getEyebrowServices = async (): Promise<ServiceResponse> => {
  try {
    return await getServices({ category: "eyebrow", search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch eyebrow services"
    );
  }
};

// Get all lashes services
export const getLashesServices = async (): Promise<ServiceResponse> => {
  try {
    return await getServices({ category: "lashes", search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch lashes services"
    );
  }
};

// Get all facial services
export const getFacialServices = async (): Promise<ServiceResponse> => {
  try {
    return await getServices({ category: "facial", search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch facial services"
    );
  }
};

// Get all nails services
export const getNailsServices = async (): Promise<ServiceResponse> => {
  try {
    return await getServices({ category: "nails", search: "" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch nails services"
    );
  }
};

// Search services by name/description
export const searchServices = async (
  searchTerm: string
): Promise<ServiceResponse> => {
  try {
    return await getServices({ search: searchTerm, category: "all" });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to search services"
    );
  }
};
