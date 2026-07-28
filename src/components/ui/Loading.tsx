type LoadingSize = "small" | "medium" | "large";

const sizeClasses: Record<LoadingSize, string> = {
  small: "h-4 w-4",
  medium: "h-8 w-8",
  large: "h-12 w-12",
};

const LoadingSpinner = ({
  size = "medium",
  text = "Loading…",
}: {
  size?: LoadingSize;
  text?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}
      aria-hidden="true"
    />
    <p className="mt-4 text-gray-600">{text}</p>
  </div>
);

export { LoadingSpinner };
