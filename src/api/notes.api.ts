import api from "@/axios/api.axios";
import { apiError } from "./api-error";
import type {
  AdminNote,
  AdminNoteFormData,
  Paginated,
} from "@/interface/admin.interface";

export interface NoteFilters {
  is_important?: boolean;
  search?: string;
  page?: number;
}

export const getNotes = async (
  filters?: NoteFilters
): Promise<Paginated<AdminNote>> => {
  try {
    const response = await api.get<Paginated<AdminNote>>("/admin-notes/", {
      params: {
        ...(filters?.is_important !== undefined
          ? { is_important: filters.is_important }
          : {}),
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.page ? { page: filters.page } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load notes.");
  }
};

export const createNote = async (
  data: AdminNoteFormData
): Promise<AdminNote> => {
  try {
    const response = await api.post<AdminNote>("/admin-notes/", data);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to create the note.");
  }
};

export const updateNote = async (
  noteId: number,
  data: AdminNoteFormData
): Promise<AdminNote> => {
  try {
    const response = await api.put<AdminNote>(`/admin-notes/${noteId}/`, data);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update the note.");
  }
};

export const toggleNoteImportant = async (
  noteId: number
): Promise<AdminNote> => {
  try {
    const response = await api.post<AdminNote>(
      `/admin-notes/${noteId}/toggle_important/`
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to change the note.");
  }
};

export const deleteNote = async (noteId: number): Promise<void> => {
  try {
    await api.delete(`/admin-notes/${noteId}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete the note.");
  }
};
