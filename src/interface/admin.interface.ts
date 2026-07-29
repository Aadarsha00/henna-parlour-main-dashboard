export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_percentage: string | null;
  discount_amount: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_services: number[];
  applicable_services_names: string[];
  terms_conditions: string;
  created_at: string;
  updated_at: string;
  is_currently_active: boolean;
}

export interface PromotionFormData {
  title: string;
  description: string;
  discount_percentage: string;
  discount_amount: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_services: number[];
  terms_conditions: string;
}

export type ContactMessageStatus = "Unread" | "Read" | "Responded";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_responded: boolean;
  admin_notes: string;
  status: ContactMessageStatus;
  created_at: string;
}

export interface ContactMessageStats {
  total: number;
  unread: number;
  pending: number;
  responded: number;
}

export interface AdminNoteAuthor {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AdminNote {
  id: number;
  title: string;
  content: string;
  created_by: AdminNoteAuthor | null;
  created_by_name: string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminNoteFormData {
  title: string;
  content: string;
  is_important: boolean;
}

export interface SalonClosure {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  /**
   * Bookings that already exist inside the closed range. Closing a date does
   * not cancel anything, so these customers still need contacting.
   */
  affected_appointments: number;
  created_at: string;
}

export interface SalonClosureFormData {
  start_date: string;
  end_date: string;
  reason: string;
}
