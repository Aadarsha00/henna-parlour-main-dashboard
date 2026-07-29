import api from "@/axios/api.axios";
import { apiError } from "./api-error";
import type {
  ContactMessage,
  ContactMessageStats,
  Paginated,
} from "@/interface/admin.interface";

export interface MessageFilters {
  is_read?: boolean;
  is_responded?: boolean;
  search?: string;
  page?: number;
}

export const getMessages = async (
  filters?: MessageFilters
): Promise<Paginated<ContactMessage>> => {
  try {
    const response = await api.get<Paginated<ContactMessage>>(
      "/contact-messages/",
      {
        params: {
          ...(filters?.is_read !== undefined
            ? { is_read: filters.is_read }
            : {}),
          ...(filters?.is_responded !== undefined
            ? { is_responded: filters.is_responded }
            : {}),
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.page ? { page: filters.page } : {}),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load messages.");
  }
};

export const getMessageStats = async (): Promise<ContactMessageStats> => {
  try {
    const response = await api.get<ContactMessageStats>(
      "/contact-messages/stats/"
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to load message statistics.");
  }
};

export const markMessageRead = async (
  messageId: number
): Promise<ContactMessage> => {
  try {
    const response = await api.post<ContactMessage>(
      `/contact-messages/${messageId}/mark_read/`
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to mark the message as read.");
  }
};

export const markMessageResponded = async (
  messageId: number
): Promise<ContactMessage> => {
  try {
    const response = await api.post<ContactMessage>(
      `/contact-messages/${messageId}/mark_responded/`
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to mark the message as responded.");
  }
};

export const saveMessageNotes = async (
  messageId: number,
  adminNotes: string
): Promise<ContactMessage> => {
  try {
    const response = await api.patch<ContactMessage>(
      `/contact-messages/${messageId}/`,
      { admin_notes: adminNotes }
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to save your notes.");
  }
};

export const deleteMessage = async (messageId: number): Promise<void> => {
  try {
    await api.delete(`/contact-messages/${messageId}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete the message.");
  }
};
