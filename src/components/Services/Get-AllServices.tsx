import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { getServices, deleteService } from "@/api/services.api";
import { ErrorMessage } from "../ui/Error";
import ServiceFilters from "./Service-Filter";
import ServicesList from "./Service-List";
import type {
  ServiceFilter,
  ServicesResponse,
} from "@/interface/Service.interface";

const AllServicesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ServiceFilter>({
    category: "lashes",
    search: "",
  });

  // Fetch services query
  const {
    data: serviceResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ServicesResponse, Error>({
    queryKey: ["services", filters],
    queryFn: () => getServices(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Extract services and pagination info from response
  const services = serviceResponse?.results || [];
  const totalCount = serviceResponse?.count || 0;
  const hasNext = serviceResponse?.next !== null;
  const hasPrevious = serviceResponse?.previous !== null;

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      console.log("Service deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete service:", error);
    },
  });

  const handleFiltersChange = (newFilters: ServiceFilter) => {
    setFilters(newFilters);
  };

  const handleDeleteService = async (serviceId: number): Promise<void> => {
    await deleteServiceMutation.mutateAsync(serviceId);
  };

  const handleAddService = () => {
    navigate("/services/add");
  };

  if (isError) {
    return (
      <ErrorMessage
        title="Error loading services"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-full w-full bg-gray-50 py-8 px-0 font-display">
      <div className="w-full px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All Services
            </h1>
            <p className="text-gray-600">Manage and view all salon services</p>
          </div>
          <button
            onClick={handleAddService}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </button>
        </div>

        {/* Filters */}
        <ServiceFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isFetching}
        />

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading
              ? "Loading..."
              : `${totalCount} service${totalCount !== 1 ? "s" : ""} found${
                  services.length !== totalCount
                    ? ` (showing ${services.length})`
                    : ""
                }`}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center space-x-1 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Services List */}
        <ServicesList
          services={services}
          isLoading={isLoading}
          onDelete={handleDeleteService}
          onUpdate={async (serviceId: number): Promise<void> =>
            navigate(`/services/update/${serviceId}`)
          }
        />

        {/* Pagination Info (if needed) */}
        {(hasNext || hasPrevious) && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {services.length} of {totalCount} services
            </div>
            <div className="flex space-x-2">
              {hasPrevious && (
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
              )}
              {hasNext && (
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllServicesPage;
