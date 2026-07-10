export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastState | null) => void;

const listeners = new Set<Listener>();
let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const showToast = (message: string, type: ToastType = "info") => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  listeners.forEach((listener) => listener({ message, type }));

  timeoutId = setTimeout(() => {
    listeners.forEach((listener) => listener(null));
  }, 3200);
};

export const subscribeToast = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
