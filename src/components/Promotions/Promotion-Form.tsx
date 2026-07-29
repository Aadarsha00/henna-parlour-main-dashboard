import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/api/services.api";
import type { ServiceResponse } from "@/interface/Service.interface";
import type { PromotionFormData } from "@/interface/admin.interface";

const emptyForm: PromotionFormData = {
  title: "",
  description: "",
  discount_percentage: "",
  discount_amount: "",
  start_date: "",
  end_date: "",
  is_active: true,
  applicable_services: [],
  terms_conditions: "",
};

interface PromotionFormProps {
  initialValues?: PromotionFormData;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (data: PromotionFormData) => void;
  onCancel: () => void;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  initialValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<PromotionFormData>(
    initialValues ?? emptyForm
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { data: serviceData } = useQuery<ServiceResponse>({
    queryKey: ["services", "promotion-picker"],
    queryFn: () => getServices(),
  });

  const services = serviceData?.results ?? [];

  const update = <K extends keyof PromotionFormData>(
    key: K,
    value: PromotionFormData[K]
  ) => setForm((current) => ({ ...current, [key]: value }));

  const toggleService = (serviceId: number) =>
    setForm((current) => ({
      ...current,
      applicable_services: current.applicable_services.includes(serviceId)
        ? current.applicable_services.filter((id) => id !== serviceId)
        : [...current.applicable_services, serviceId],
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are both required.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setFormError("Choose a start date and an end date.");
      return;
    }
    if (form.end_date < form.start_date) {
      setFormError("The end date cannot be before the start date.");
      return;
    }
    // Mirrors the server rule so the user is not bounced by a round trip.
    if (!form.discount_percentage && !form.discount_amount) {
      setFormError("Enter a discount percentage or a discount amount.");
      return;
    }

    setFormError(null);
    onSubmit(form);
  };

  const fieldClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border p-5 mb-6 space-y-4"
    >
      <div>
        <label
          htmlFor="promotion-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          id="promotion-title"
          type="text"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="promotion-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="promotion-description"
          rows={3}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="promotion-percentage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Discount percentage
          </label>
          <input
            id="promotion-percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form.discount_percentage}
            onChange={(event) =>
              update("discount_percentage", event.target.value)
            }
            placeholder="e.g. 15"
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="promotion-amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Discount amount
          </label>
          <input
            id="promotion-amount"
            type="number"
            min="0"
            step="0.01"
            value={form.discount_amount}
            onChange={(event) => update("discount_amount", event.target.value)}
            placeholder="e.g. 10.00"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="promotion-start"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Starts
          </label>
          <input
            id="promotion-start"
            type="date"
            value={form.start_date}
            onChange={(event) => update("start_date", event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="promotion-end"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ends
          </label>
          <input
            id="promotion-end"
            type="date"
            value={form.end_date}
            onChange={(event) => update("end_date", event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {services.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">
            Applies to (leave empty for all services)
          </legend>
          <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 p-3 space-y-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={form.applicable_services.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {service.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label
          htmlFor="promotion-terms"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Terms and conditions
        </label>
        <textarea
          id="promotion-terms"
          rows={2}
          value={form.terms_conditions}
          onChange={(event) => update("terms_conditions", event.target.value)}
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => update("is_active", event.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Active
      </label>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PromotionForm;
