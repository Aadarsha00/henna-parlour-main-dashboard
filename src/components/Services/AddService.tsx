import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { createService } from "@/api/services.api";
import ServiceForm from "./Service-Form";
import type { ServiceFormData } from "@/interface/Service.interface";

const AddServicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormData) => createService(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      console.log("Service created successfully:", data);
      navigate("/services", {
        state: { message: "Service created successfully!" },
      });
    },
    onError: (error) => {
      console.error("Failed to create service:", error);
    },
  });

  const handleSubmit = async (formData: ServiceFormData) => {
    await createServiceMutation.mutateAsync(formData);
  };

  const handleBack = () => {
    navigate("/services");
  };

  return (
    <div className="min-h-full w-full bg-gray-50 py-8 px-0 font-display">
      <div className="w-full px-6 ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Plus className="w-8 h-8 mr-3 text-blue-600" />
                Add New Service
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new service for your salon
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            <ServiceForm
              onSubmit={handleSubmit}
              isLoading={createServiceMutation.status === "pending"}
              submitButtonText="Create Service"
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Tips for creating a service:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Use clear, descriptive names that customers will understand
            </li>
            <li>
              • Include important details in the description (what's included,
              preparation needed, etc.)
            </li>
            <li>• Set realistic durations including prep and cleanup time</li>
            <li>
              • Price competitively based on your market and service complexity
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddServicePage;
