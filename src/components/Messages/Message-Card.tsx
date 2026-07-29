import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, Mail, Phone, Reply, Trash2 } from "lucide-react";
import type {
  ContactMessage,
  ContactMessageStatus,
} from "@/interface/admin.interface";

const statusStyles: Record<ContactMessageStatus, string> = {
  Unread: "bg-red-100 text-red-700",
  Read: "bg-blue-100 text-blue-700",
  Responded: "bg-green-100 text-green-700",
};

const formatTimestamp = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : format(parsed, "MMM d, yyyy 'at' h:mm a");
};

interface MessageCardProps {
  message: ContactMessage;
  isBusy: boolean;
  onMarkRead: (id: number) => void;
  onMarkResponded: (id: number) => void;
  onSaveNotes: (id: number, notes: string) => void;
  onDelete: (id: number) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  isBusy,
  onMarkRead,
  onMarkResponded,
  onSaveNotes,
  onDelete,
}) => {
  const [notes, setNotes] = useState(message.admin_notes);

  // Keep the box in step when the server copy changes underneath us.
  useEffect(() => {
    setNotes(message.admin_notes);
  }, [message.admin_notes]);

  const notesChanged = notes !== message.admin_notes;
  const replyHref = `mailto:${encodeURIComponent(
    message.email
  )}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;

  return (
    <article
      className={`bg-white rounded-lg shadow-sm border p-5 ${
        message.is_read ? "border-gray-200" : "border-l-4 border-l-red-500"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 break-words">
            {message.subject}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {message.name} · {formatTimestamp(message.created_at)}
          </p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
            statusStyles[message.status]
          }`}
        >
          {message.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <a
          href={`mailto:${message.email}`}
          className="inline-flex items-center gap-1.5 hover:text-blue-600 break-all"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          {message.email}
        </a>
        {message.phone && (
          <a
            href={`tel:${message.phone}`}
            className="inline-flex items-center gap-1.5 hover:text-blue-600"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {message.phone}
          </a>
        )}
      </div>

      <p className="mt-4 text-gray-800 whitespace-pre-wrap break-words">
        {message.message}
      </p>

      <div className="mt-4">
        <label
          htmlFor={`notes-${message.id}`}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Internal notes
        </label>
        <textarea
          id={`notes-${message.id}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          placeholder="Only staff can see this."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {notesChanged && (
          <button
            type="button"
            onClick={() => onSaveNotes(message.id, notes)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save notes
          </button>
        )}
        <a
          href={replyHref}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Reply className="h-4 w-4" aria-hidden="true" />
          Reply by email
        </a>
        {!message.is_read && (
          <button
            type="button"
            onClick={() => onMarkRead(message.id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Mark read
          </button>
        )}
        {!message.is_responded && (
          <button
            type="button"
            onClick={() => onMarkResponded(message.id)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Mark responded
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(message.id)}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
};

export default MessageCard;
