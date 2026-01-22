import React from "react";
import ServiceCard from "./Service-Card";
import type { Service } from "@/interface/Service.interface";
import { LoadingSpinner } from "../ui/Loading";

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  onDelete: (serviceId: number) => Promise<void>;
  onUpdate: (serviceId: number) => Promise<void>;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  isLoading,
  onDelete,
  onUpdate,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Empty state
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No services found
        </h3>
        <p className="text-gray-500 mb-4">
          Try adjusting your filters or add a new service to get started.
        </p>
      </div>
    );
  }

  // Services grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default ServicesList;
