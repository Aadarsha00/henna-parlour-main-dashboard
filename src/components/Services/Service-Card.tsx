import { useState } from "react";
import { Clock, DollarSign, Eye, Edit, Trash2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeleteServiceDialog from "./Delete-Service";
import type { Service } from "@/interface/Service.interface";

interface ServiceCardProps {
  service: Service;
  onDelete: (id: number) => Promise<void>;
  onUpdate?: (id: number) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onDelete }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      hair: "bg-purple-100 text-purple-800",
      eyebrow: "bg-pink-100 text-pink-800",
      facial: "bg-green-100 text-green-800",
      nails: "bg-blue-100 text-blue-800",
      lashes: "bg-indigo-100 text-indigo-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.default;
  };

  const handleServiceClick = () => {
    navigate(`/services/${service.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/services/update/${service.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/services/${service.id}`);
  };

  const confirmDelete = async () => {
    try {
      await onDelete(service.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  return (
    <>
      <div
        onClick={handleServiceClick}
        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            <div className="flex items-center space-x-1">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                  service.category
                )}`}
              >
                {service.category}
              </span>
              {service.requires_deposit && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  Deposit
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              {formatDuration(service.duration_minutes)}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <DollarSign className="w-4 h-4 mr-2" />
              {formatPrice(service.price)}
            </div>
            {service.requires_deposit && (
              <div className="flex items-center text-sm text-orange-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Deposit: {formatPrice(service.deposit_amount)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400">ID: {service.id}</div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleView}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Edit Service"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteServiceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        serviceName={service.name}
      />
    </>
  );
};

export default ServiceCard;
