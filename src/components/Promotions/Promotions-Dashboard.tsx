import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createPromotion,
  deletePromotion,
  getPromotions,
  togglePromotionActive,
  updatePromotion,
} from "@/api/promotions.api";
import type {
  Paginated,
  Promotion,
  PromotionFormData,
} from "@/interface/admin.interface";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/Error";
import { showConfirmationToast } from "@/components/ui/confirm-toast";
import PromotionForm from "./Promotion-Form";

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "MMM d, yyyy");
};

const describeStatus = (promotion: Promotion) => {
  if (!promotion.is_active) {
    return { label: "Inactive", className: "bg-gray-100 text-gray-700" };
  }
  if (promotion.is_currently_active) {
    return { label: "Running", className: "bg-green-100 text-green-700" };
  }
  const today = new Date().toISOString().slice(0, 10);
  if (promotion.start_date > today) {
    return { label: "Scheduled", className: "bg-blue-100 text-blue-700" };
  }
  return { label: "Expired", className: "bg-yellow-100 text-yellow-700" };
};

const toFormData = (promotion: Promotion): PromotionFormData => ({
  title: promotion.title,
  description: promotion.description,
  discount_percentage: promotion.discount_percentage ?? "",
  discount_amount: promotion.discount_amount ?? "",
  start_date: promotion.start_date,
  end_date: promotion.end_date,
  is_active: promotion.is_active,
  applicable_services: promotion.applicable_services,
  terms_conditions: promotion.terms_conditions,
});

const PromotionsDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  const {
    data: promotionData,
    isLoading,
    error,
    refetch,
  } = useQuery<Paginated<Promotion>>({
    queryKey: ["promotions"],
    queryFn: () => getPromotions(),
  });

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const refreshPromotions = () => {
    void queryClient.invalidateQueries({ queryKey: ["promotions"] });
  };

  const createMutation = useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      refreshPromotions();
      closeForm();
      toast.success("Promotion created.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PromotionFormData }) =>
      updatePromotion(id, data),
    onSuccess: () => {
      refreshPromotions();
      closeForm();
      toast.success("Promotion updated.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const toggleMutation = useMutation({
    mutationFn: togglePromotionActive,
    onSuccess: refreshPromotions,
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      refreshPromotions();
      toast.success("Promotion deleted.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const handleDelete = (promotion: Promotion) => {
    showConfirmationToast({
      title: `Delete "${promotion.title}"?`,
      description: "This promotion will be removed permanently.",
      confirmLabel: "Delete promotion",
      destructive: true,
      onConfirm: () => deleteMutation.mutateAsync(promotion.id),
    });
  };

  if (error) {
    return (
      <ErrorMessage
        title="Could not load promotions"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const promotions = promotionData?.results ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600 mt-1">
            Offers shown to customers on the website.
          </p>
        </div>
        {!isCreating && !editing && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New promotion
          </button>
        )}
      </header>

      {isCreating && (
        <PromotionForm
          isSubmitting={createMutation.isPending}
          submitLabel="Create promotion"
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={closeForm}
        />
      )}

      {editing && (
        <PromotionForm
          initialValues={toFormData(editing)}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save changes"
          onSubmit={(data) =>
            updateMutation.mutate({ id: editing.id, data })
          }
          onCancel={closeForm}
        />
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading promotions…" />
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Tag className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
          <p className="mt-3 text-gray-600">No promotions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promotion) => {
            const status = describeStatus(promotion);
            return (
              <article
                key={promotion.id}
                className="bg-white rounded-lg shadow-sm border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 break-words">
                      {promotion.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(promotion.start_date)} –{" "}
                      {formatDate(promotion.end_date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-3 text-gray-800 whitespace-pre-wrap break-words">
                  {promotion.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {promotion.discount_percentage && (
                    <span className="rounded-md bg-purple-50 px-2 py-1 text-purple-700">
                      {promotion.discount_percentage}% off
                    </span>
                  )}
                  {promotion.discount_amount && (
                    <span className="rounded-md bg-purple-50 px-2 py-1 text-purple-700">
                      ${promotion.discount_amount} off
                    </span>
                  )}
                  <span className="rounded-md bg-gray-50 px-2 py-1 text-gray-700">
                    {promotion.applicable_services_names.length > 0
                      ? promotion.applicable_services_names.join(", ")
                      : "All services"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditing(promotion);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(promotion.id)}
                    disabled={toggleMutation.isPending}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {promotion.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(promotion)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromotionsDashboard;
