import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { NotebookPen, Pencil, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createNote,
  deleteNote,
  getNotes,
  toggleNoteImportant,
  updateNote,
} from "@/api/notes.api";
import type {
  AdminNote,
  AdminNoteFormData,
  Paginated,
} from "@/interface/admin.interface";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/Error";
import { showConfirmationToast } from "@/components/ui/confirm-toast";

const emptyForm: AdminNoteFormData = {
  title: "",
  content: "",
  is_important: false,
};

const formatTimestamp = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "MMM d, yyyy");
};

const NotesDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminNoteFormData | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: noteData,
    isLoading,
    error,
    refetch,
  } = useQuery<Paginated<AdminNote>>({
    queryKey: ["admin-notes"],
    queryFn: () => getNotes(),
  });

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
    setFormError(null);
  };

  const refreshNotes = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
  };

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      refreshNotes();
      closeForm();
      toast.success("Note added.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminNoteFormData }) =>
      updateNote(id, data),
    onSuccess: () => {
      refreshNotes();
      closeForm();
      toast.success("Note updated.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleNoteImportant,
    onSuccess: refreshNotes,
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      refreshNotes();
      toast.success("Note deleted.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;

    // The API enforces these lengths; checking here avoids a pointless request.
    if (form.title.trim().length < 3) {
      setFormError("The title needs at least 3 characters.");
      return;
    }
    if (form.content.trim().length < 10) {
      setFormError("The note needs at least 10 characters.");
      return;
    }

    setFormError(null);
    if (editingId === null) {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate({ id: editingId, data: form });
    }
  };

  const handleDelete = (note: AdminNote) => {
    showConfirmationToast({
      title: `Delete "${note.title}"?`,
      description: "This note will be removed permanently.",
      confirmLabel: "Delete note",
      destructive: true,
      onConfirm: () => deleteMutation.mutateAsync(note.id),
    });
  };

  if (error) {
    return (
      <ErrorMessage
        title="Could not load notes"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const notes = noteData?.results ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const fieldClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-1">
            Internal reminders for salon staff. Customers never see these.
          </p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New note
          </button>
        )}
      </header>

      {form && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border p-5 mb-6 space-y-4"
        >
          <div>
            <label
              htmlFor="note-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="note-title"
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="note-content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Note
            </label>
            <textarea
              id="note-content"
              rows={4}
              value={form.content}
              onChange={(event) =>
                setForm({ ...form, content: event.target.value })
              }
              className={fieldClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_important}
              onChange={(event) =>
                setForm({ ...form, is_important: event.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            Pin as important
          </label>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving
                ? "Saving…"
                : editingId === null
                  ? "Add note"
                  : "Save changes"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading notes…" />
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <NotebookPen
            className="mx-auto h-10 w-10 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-gray-600">No notes yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className={`bg-white rounded-lg shadow-sm border p-5 ${
                note.is_important ? "border-l-4 border-l-yellow-400" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900 break-words">
                  {note.title}
                </h2>
                <span className="shrink-0 text-sm text-gray-500">
                  {note.created_by_name} · {formatTimestamp(note.created_at)}
                </span>
              </div>

              <p className="mt-3 text-gray-800 whitespace-pre-wrap break-words">
                {note.content}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(note.id);
                    setForm({
                      title: note.title,
                      content: note.content,
                      is_important: note.is_important,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(note.id)}
                  disabled={toggleMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Star
                    className={`h-4 w-4 ${
                      note.is_important ? "fill-yellow-400 text-yellow-500" : ""
                    }`}
                    aria-hidden="true"
                  />
                  {note.is_important ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(note)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesDashboard;
