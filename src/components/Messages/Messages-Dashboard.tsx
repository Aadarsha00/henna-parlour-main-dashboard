import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Inbox } from "lucide-react";
import toast from "react-hot-toast";

import {
  deleteMessage,
  getMessageStats,
  getMessages,
  markMessageRead,
  markMessageResponded,
  saveMessageNotes,
  type MessageFilters,
} from "@/api/messages.api";
import type {
  ContactMessage,
  ContactMessageStats,
  Paginated,
} from "@/interface/admin.interface";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ErrorMessage } from "@/components/ui/Error";
import { showConfirmationToast } from "@/components/ui/confirm-toast";
import MessageCard from "./Message-Card";

type TabKey = "all" | "unread" | "pending" | "responded";

const tabs: Array<{ key: TabKey; label: string; filters: MessageFilters }> = [
  { key: "all", label: "All", filters: {} },
  { key: "unread", label: "Unread", filters: { is_read: false } },
  {
    key: "pending",
    label: "Needs reply",
    filters: { is_read: true, is_responded: false },
  },
  { key: "responded", label: "Responded", filters: { is_responded: true } },
];

const MessagesDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const activeFilters =
    tabs.find((tab) => tab.key === activeTab)?.filters ?? {};

  const {
    data: messageData,
    isLoading,
    error,
    refetch,
  } = useQuery<Paginated<ContactMessage>>({
    queryKey: ["contact-messages", activeTab, searchQuery, page],
    queryFn: () =>
      getMessages({
        ...activeFilters,
        search: searchQuery.trim() || undefined,
        page,
      }),
  });

  const { data: stats } = useQuery<ContactMessageStats>({
    queryKey: ["contact-message-stats"],
    queryFn: getMessageStats,
  });

  const refreshMessages = () => {
    void queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    void queryClient.invalidateQueries({
      queryKey: ["contact-message-stats"],
    });
  };

  const markReadMutation = useMutation({
    mutationFn: markMessageRead,
    onSuccess: refreshMessages,
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const markRespondedMutation = useMutation({
    mutationFn: markMessageResponded,
    onSuccess: () => {
      refreshMessages();
      toast.success("Marked as responded.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const saveNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      saveMessageNotes(id, notes),
    onSuccess: () => {
      refreshMessages();
      toast.success("Notes saved.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      refreshMessages();
      toast.success("Message deleted.");
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const isBusy =
    markReadMutation.isPending ||
    markRespondedMutation.isPending ||
    saveNotesMutation.isPending ||
    deleteMutation.isPending;

  const handleDelete = (id: number) => {
    showConfirmationToast({
      title: "Delete this message?",
      description: "The customer's enquiry will be removed permanently.",
      confirmLabel: "Delete message",
      destructive: true,
      onConfirm: () => deleteMutation.mutateAsync(id),
    });
  };

  const changeTab = (key: TabKey) => {
    setActiveTab(key);
    setPage(1);
  };

  if (error) {
    return (
      <ErrorMessage
        title="Could not load messages"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const messages = messageData?.results ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Enquiries sent from the contact form on the website.
        </p>
      </header>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.unread}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Needs reply</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.responded}
            </div>
            <div className="text-sm text-gray-600">Responded</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <label htmlFor="message-search" className="sr-only">
            Search messages
          </label>
          <input
            id="message-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or subject…"
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading messages…" />
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Inbox
            className="mx-auto h-10 w-10 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-gray-600">
            {searchQuery
              ? "No messages match that search."
              : "No messages in this view."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              isBusy={isBusy}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onMarkResponded={(id) => markRespondedMutation.mutate(id)}
              onSaveNotes={(id, notes) =>
                saveNotesMutation.mutate({ id, notes })
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {(messageData?.previous || messageData?.next) && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!messageData?.previous}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!messageData?.next}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesDashboard;
