/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { getService, updateService, deleteService } from "@/api/services.api";
import { LoadingSpinner } from "../ui/Loading";
import { ErrorMessage } from "../ui/Error";
import ServiceForm from "./Service-Form";
import DeleteServiceDialog from "./Delete-Service";
import type { Service, ServiceFormData } from "@/interface/Service.interface";

const UpdateServicePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get service ID from URL params and parse it
  const { id } = useParams<{ id: string }>();
  const serviceId = id ? parseInt(id, 10) : NaN;

  // If serviceId is invalid, render an error immediately (no hooks inside this)
  if (isNaN(serviceId)) {
    return (
      <div className="min-h-full w-full bg-gray-50 py-8 px-0 flex items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">
          Invalid Service ID.
        </p>
      </div>
    );
  }

  // Fetch service details - hook is called unconditionally
  const {
    data: service,
    isLoading,
    isError,
    error,
  } = useQuery<Service, Error>({
    queryKey: ["service", serviceId],
    queryFn: () => getService(serviceId),
    enabled: true, // always enabled since serviceId is valid here
  });

  // Transform Service to ServiceFormData
  const formData = useMemo<Partial<ServiceFormData> | undefined>(() => {
    if (!service) return undefined;
    
    return {
      name: service.name,
      description: service.description,
      price: String(service.price), // Convert to string
      category: service.category,
      duration_minutes: service.duration_minutes,
      deposit_amount: String(service.deposit_amount), // Convert to string
      requires_deposit: service.requires_deposit,
    };
  }, [service]);

  // Mutation to update service
  const updateServiceMutation = useMutation({
    mutationFn: (data: ServiceFormData) => updateService(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      navigate("/services", {
        state: { message: "Service updated successfully!" },
      });
    },
  });

  // Mutation to delete service
  const deleteServiceMutation = useMutation({
    mutationFn: () => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      navigate("/services", {
        state: { message: "Service deleted successfully!" },
      });
    },
  });

  // State to control delete confirmation dialog visibility
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Submit handler for the form
  const handleSubmit = async (formData: ServiceFormData) => {
    await updateServiceMutation.mutateAsync(formData);
  };

  // Back button handler
  const handleBack = () => {
    navigate("/services");
  };

  // Confirm delete handler
  const handleDelete = async () => {
    await deleteServiceMutation.mutateAsync();
    setShowDeleteDialog(false);
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="min-h-full w-full bg-gray-50 py-8 px-0">
        <div className="w-full px-6 max-w-4xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state UI
  if (isError) {
    return (
      <div className="min-h-full w-full bg-gray-50 py-8 px-0">
        <div className="w-full px-6 max-w-4xl mx-auto">
          <ErrorMessage
            title="Error loading service"
            message={error?.message || "Unknown error"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Main UI render
  return (
    <>
      <div className="min-h-full w-full bg-gray-50 py-8 px-0 font-display">
        <div className="w-full px-6 ">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Edit className="w-8 h-8 mr-3 text-green-600" />
                    Update Service
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Modify service details and settings
                  </p>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Service
              </button>
            </div>
          </div>

          {/* Service Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Current Service: {service?.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Category:</span>{" "}
                {service?.category}
              </div>
              <div>
                <span className="font-medium">Duration:</span>{" "}
                {service?.duration_minutes}
              </div>
              <div>
                <span className="font-medium">Price:</span> ${service?.price}
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8">
              <ServiceForm
                onSubmit={handleSubmit}
                initialData={formData}
                isLoading={updateServiceMutation.status === "pending"}
                submitButtonText="Update Service"
              />
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2">
              Important notes about updating services:
            </h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>
                • Changes will affect all future bookings for this service
              </li>
              <li>
                • Existing bookings will retain their original service details
              </li>
              <li>
                • Price changes won't affect bookings that are already confirmed
              </li>
              <li>
                • Deactivating a service will prevent new bookings but won't
                cancel existing ones
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteServiceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        serviceName={service?.name ?? "this service"}
      />
    </>
  );
};

export default UpdateServicePage;