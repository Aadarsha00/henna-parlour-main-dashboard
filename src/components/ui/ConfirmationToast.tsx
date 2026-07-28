import toast, { type Toast } from "react-hot-toast";

export interface ConfirmationToastOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<unknown>;
}

export const ConfirmationToast = ({
  confirmationToast,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
}: ConfirmationToastOptions & { confirmationToast: Toast }) => {
  const titleId = `confirmation-${confirmationToast.id}`;
  const close = () => toast.dismiss(confirmationToast.id);

  const confirm = () => {
    close();
    void Promise.resolve(onConfirm()).catch(() => undefined);
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      className="w-[min(92vw,26rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
    >
      <p id={titleId} className="text-sm font-semibold text-gray-900">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={close}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {cancelLabel ?? "Cancel"}
        </button>
        <button
          type="button"
          onClick={confirm}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            destructive
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              : "bg-gray-900 hover:bg-gray-700 focus:ring-gray-600"
          }`}
        >
          {confirmLabel ?? "Confirm"}
        </button>
      </div>
    </div>
  );
};
