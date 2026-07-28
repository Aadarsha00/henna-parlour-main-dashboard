import toast from "react-hot-toast";
import {
  ConfirmationToast,
  type ConfirmationToastOptions,
} from "./ConfirmationToast";

export const showConfirmationToast = (options: ConfirmationToastOptions) => {
  toast.custom(
    (confirmationToast) => (
      <ConfirmationToast
        {...options}
        confirmationToast={confirmationToast}
      />
    ),
    {
      duration: Infinity,
      position: "top-center",
    }
  );
};
