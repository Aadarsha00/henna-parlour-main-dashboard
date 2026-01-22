/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Clock, DollarSign, Trash2, Pencil, CreditCard } from "lucide-react";

import { getService, deleteService } from "@/api/services.api";
import type { Service } from "@/interface/Service.interface";
import { LoadingSpinner } from "../ui/Loading";
import { ErrorMessage } from "../ui/Error";
import DeleteServiceDialog from "./Delete-Service";

const SimpleButton = ({
  onClick,
  children,
  variant = "default",
  disabled = false,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
  title?: string;
}) => {
  const baseStyle =
    "px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center gap-1";

  let variantStyle = "";
  if (variant === "default")
    variantStyle =
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  else if (variant === "outline")
    variantStyle =
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400";
  else if (variant === "destructive")
    variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyle} ${variantStyle} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const parsedId = id ? parseInt(id, 10) : null;

  const {
    data: service,
    isLoading,
    isError,
    error,
  } = useQuery<Service, Error>({
    queryKey: ["service", parsedId],
    queryFn: () => getService(parsedId!),
    enabled: !!parsedId,
  });

  const deleteServiceMutation = useMutation<void, Error>({
    mutationFn: () => deleteService(parsedId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      navigate("/services", {
        state: { message: "Service deleted successfully!" },
      });
    },
    onError: (error) => {
      console.error("Failed to delete service:", error);
    },
  });

  const handleDelete = async (): Promise<void> => {
    await deleteServiceMutation.mutateAsync();
    setShowDeleteDialog(false);
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ""}`
      : `${minutes}m`;
  };

  const formatPrice = (price?: string | number): string => {
    if (!price) return "$0.00";
    return `$${Number(price).toFixed(2)}`;
  };

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      hair: "bg-purple-100 text-purple-800 border-purple-200",
      eyebrow: "bg-pink-100 text-pink-800 border-pink-200",
      facial: "bg-green-100 text-green-800 border-green-200",
      nails: "bg-blue-100 text-blue-800 border-blue-200",
      lashes: "bg-indigo-100 text-indigo-800 border-indigo-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return category ? colors[category] || colors.default : colors.default;
  };

  if (!parsedId) {
    return <div className="p-6 text-red-500">Invalid service ID.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-6">
        <ErrorMessage
          title="Failed to load service"
          message={error?.message || "Unknown error"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 sm:px-6 lg:px-8 font-display">
      <div className="bg-white p-6 rounded-xl shadow-md border max-w-4xl mx-auto transition-all duration-300 hover:shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
              {service?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {service?.name}
              </h2>
              <div className="flex space-x-2 mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(
                    service?.category
                  )}`}
                >
                  {service?.category}
                </span>
                {service?.requires_deposit && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    Deposit Required
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <SimpleButton
              variant="outline"
              title="Edit Service"
              onClick={() => navigate(`/services/update/${service?.id}`)}
            >
              <Pencil className="w-4 h-4" /> Edit
            </SimpleButton>
            <SimpleButton
              variant="destructive"
              title="Delete Service"
              onClick={() => setShowDeleteDialog(true)}
              disabled={(deleteServiceMutation as any).isLoading}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </SimpleButton>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">{service?.description}</p>

        <hr className="mb-6" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              <span className="font-medium">Duration:</span>
              <span className="ml-2">
                {formatDuration(service?.duration_minutes)}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
              <span className="font-medium">Price:</span>
              <span className="ml-2">{formatPrice(service?.price)}</span>
            </div>
            {service?.requires_deposit && (
              <div className="flex items-center text-orange-700">
                <CreditCard className="w-5 h-5 mr-3 text-orange-400" />
                <span className="font-medium">Deposit:</span>
                <span className="ml-2">
                  {formatPrice(service?.deposit_amount)}
                </span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            <div>
              <span className="font-medium text-gray-700">Created:</span>{" "}
              {service?.created_at
                ? format(parseISO(service.created_at), "PPPp")
                : "N/A"}
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>{" "}
              {service?.updated_at
                ? format(parseISO(service.updated_at), "PPPp")
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      <DeleteServiceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        serviceName={service?.name || ""}
        loading={deleteServiceMutation.status === "pending"}
      />
    </div>
  );
};

export default ServiceDetailPage;
