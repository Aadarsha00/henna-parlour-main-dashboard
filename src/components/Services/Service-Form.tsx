import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Clock, DollarSign, FileText, Tag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getServiceCategories } from "@/api/services.api";
import type { ServiceFormData } from "@/interface/Service.interface";

interface ServiceFormProps {
  onSubmit: SubmitHandler<ServiceFormData>;
  initialData?: Partial<ServiceFormData> | null;
  isLoading?: boolean;
  submitButtonText?: string;
}

const ServiceForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  submitButtonText = "Save Service",
}: ServiceFormProps) => {
  // Fetch categories from API
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["service-categories"],
    queryFn: getServiceCategories,
    staleTime: 0,
    gcTime: 0, // Don't cache at all - always fetch fresh
    retry: 3,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: "",
      description: "",
      duration_minutes: 60,
      price: "",
      category: initialData?.category || (categories[0] || ""),
      deposit_amount: "0.00",
      requires_deposit: false,
      ...initialData,
    },
  });

  const requiresDeposit = watch("requires_deposit");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onFormSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const toggleDeposit = () => {
    setValue("requires_deposit", !requiresDeposit);
    if (!requiresDeposit && !watch("deposit_amount")) {
      setValue("deposit_amount", "0.00");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Service Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Name *
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            {...register("name", {
              required: "Service name is required",
              minLength: {
                value: 2,
                message: "Service name must be at least 2 characters",
              },
            })}
            type="text"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter service name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <textarea
            {...register("description", {
              required: "Description is required",
              minLength: {
                value: 10,
                message: "Description must be at least 10 characters",
              },
            })}
            rows={4}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter service description"
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Duration and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              {...register("duration_minutes", {
                required: "Duration is required",
                min: {
                  value: 1,
                  message: "Duration must be at least 1 minute",
                },
                max: { value: 480, message: "Duration cannot exceed 8 hours" },
              })}
              type="number"
              min="1"
              max="480"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.duration_minutes ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="60"
            />
          </div>
          {errors.duration_minutes && (
            <p className="mt-1 text-sm text-red-600">
              {errors.duration_minutes.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Include preparation and cleanup time
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              {...register("price", {
                required: "Price is required",
                min: { value: 0.01, message: "Price must be greater than 0" },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message:
                    "Price must be a valid number with up to 2 decimal places",
                },
              })}
              type="number"
              step="0.01"
              min="0"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Base price for this service
          </p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        {categoriesLoading ? (
          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-gray-500">Loading categories...</span>
          </div>
        ) : categoriesError ? (
          <div className="flex items-center px-4 py-3 border border-red-300 rounded-lg bg-red-50">
            <span className="text-red-600">Failed to load categories</span>
          </div>
        ) : (
          <select
            {...register("category", { required: "Category is required" })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
              errors.category ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Select a category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category} value={category}>
                  {category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Choose the most appropriate category for this service
        </p>
      </div>

      {/* Deposit Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Deposit Required
            </h4>
            <p className="text-sm text-gray-600">
              {requiresDeposit
                ? "This service requires a deposit before booking"
                : "No deposit required for this service"}
            </p>
          </div>
          <div className="ml-4">
            <button
              type="button"
              onClick={toggleDeposit}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                requiresDeposit ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label="Toggle deposit requirement"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  requiresDeposit ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Deposit Amount */}
        {requiresDeposit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register("deposit_amount", {
                  required: requiresDeposit
                    ? "Deposit amount is required"
                    : false,
                  min: {
                    value: 0.01,
                    message: "Deposit must be greater than 0",
                  },
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message:
                      "Deposit must be a valid number with up to 2 decimal places",
                  },
                })}
                type="number"
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.deposit_amount ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.deposit_amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deposit_amount.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Amount customers must pay upfront
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              requiresDeposit ? "bg-orange-400" : "bg-green-400"
            }`}
          ></div>
          <span
            className={`text-xs font-medium ${
              requiresDeposit ? "text-orange-600" : "text-green-600"
            }`}
          >
            {requiresDeposit ? "DEPOSIT REQUIRED" : "NO DEPOSIT"}
          </span>
        </div>

        {/* Hidden input for form submission */}
        <input
          type="hidden"
          {...register("requires_deposit")}
          value={requiresDeposit ? "true" : "false"}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">* Required fields</div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[120px]"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{submitButtonText}</span>
            )}
          </button>
        </div>
      </div>

      {/* Form Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">
          Form Guidelines:
        </h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Service names should be clear and descriptive</li>
          <li>• Descriptions help customers understand what's included</li>
          <li>• Duration should include all prep and cleanup time</li>
          <li>• Deposits help secure bookings for premium services</li>
        </ul>
      </div>
    </form>
  );
};

export default ServiceForm;
