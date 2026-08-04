import { Toaster } from "sonner";

export function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3500}
      visibleToasts={4}
    />
  );
}