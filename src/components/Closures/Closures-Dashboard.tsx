import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, CalendarOff, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createClosure,
  deleteClosure,
  getClosures,
} from "@/api/closures.api";
import type {
  Paginated,
  SalonClosure,
  SalonClosureFormData,
} from "@/interface/admin.interface";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/Error";
import { showConfirmationToast } from "@/components/ui/confirm-toast";

const emptyForm: SalonClosureFormData = {
  start_date: "",
  end_date: "",
  reason: "",
};

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "MMM d, yyyy");
};

const describeRange = (closure: SalonClosure) =>
  closure.start_date === closure.end_date
    ? formatDate(closure.start_date)
    : `${formatDate(closure.start_date)} – ${formatDate(closure.end_date)}`;

const ClosuresDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SalonClosureFormData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: closureData,
    isLoading,
    error,
    refetch,
  } = useQuery<Paginated<SalonClosure>>({
    queryKey: ["salon-closures"],
    queryFn: () => getClosures(),
  });

  const refreshClosures = () => {
    void queryClient.invalidateQueries({ queryKey: ["salon-closures"] });
  };

  const createMutation = useMutation({
    mutationFn: createClosure,
    onSuccess: (closure) => {
      refreshClosures();
      setForm(null);
      setFormError(null);
      if (closure.affected_appointments > 0) {
        toast(
          `Closed. ${closure.affected_appointments} existing booking(s) fall in this range and still need cancelling.`,
          { icon: "⚠️", duration: 8000 }
        );
      } else {
        toast.success("Closure added.");
      }
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClosure,
    onSuccess: () => {
      refreshClosures();
      toast.success("Closure removed. The salon accepts bookings again.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;

    if (!form.start_date || !form.end_date) {
      setFormError("Choose a first and last closed day.");
      return;
    }
    if (form.end_date < form.start_date) {
      setFormError("The last day cannot be before the first day.");
      return;
    }

    setFormError(null);
    createMutation.mutate(form);
  };

  const handleDelete = (closure: SalonClosure) => {
    showConfirmationToast({
      title: `Reopen ${describeRange(closure)}?`,
      description: "Customers will be able to book these dates again.",
      confirmLabel: "Reopen dates",
      destructive: true,
      onConfirm: () => deleteMutation.mutateAsync(closure.id),
    });
  };

  if (error) {
    return (
      <ErrorMessage
        title="Could not load closures"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const closures = closureData?.results ?? [];
  const fieldClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Closures</h1>
          <p className="text-gray-600 mt-1">
            Holidays and time off. Customers cannot book these dates.
          </p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Close dates
          </button>
        )}
      </header>

      <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <AlertTriangle
          className="h-5 w-5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <p className="text-sm text-blue-900">
          Closing a date only stops <strong>new</strong> bookings. Appointments
          already booked stay in the diary on purpose, so nothing disappears
          without you telling the customer. Cancel those from the Appointments
          page.
        </p>
      </div>

      {form && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border p-5 mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="closure-start"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First closed day
              </label>
              <input
                id="closure-start"
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    start_date: event.target.value,
                    // A single-day closure is the common case; prefill the end.
                    end_date: form.end_date || event.target.value,
                  })
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="closure-end"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last closed day
              </label>
              <input
                id="closure-end"
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm({ ...form, end_date: event.target.value })
                }
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="closure-reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason (shown to customers)
            </label>
            <input
              id="closure-reason"
              type="text"
              value={form.reason}
              onChange={(event) =>
                setForm({ ...form, reason: event.target.value })
              }
              placeholder="e.g. Thanksgiving"
              className={fieldClass}
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving…" : "Close these dates"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setFormError(null);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading closures…" />
      ) : closures.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <CalendarOff
            className="mx-auto h-10 w-10 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-gray-600">
            No closed dates. The salon is bookable on every working day.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {closures.map((closure) => (
            <article
              key={closure.id}
              className="bg-white rounded-lg shadow-sm border p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {describeRange(closure)}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {closure.reason || "No reason given"}
                </p>
                {closure.affected_appointments > 0 && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-yellow-700">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    {closure.affected_appointments} booking(s) still in the
                    diary
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(closure)}
                disabled={deleteMutation.isPending}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Reopen
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClosuresDashboard;
