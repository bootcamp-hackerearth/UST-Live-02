export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

type Listener = (state: ConfirmState | null) => void;

const listeners = new Set<Listener>();

export const confirmAction = (options: ConfirmOptions) =>
  new Promise<boolean>((resolve) => {
    listeners.forEach((listener) =>
      listener({
        ...options,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        resolve,
      }),
    );
  });

export const closeConfirm = (
  state: ConfirmState | null,
  confirmed: boolean,
) => {
  if (state) {
    state.resolve(confirmed);
  }

  listeners.forEach((listener) => listener(null));
};

export const subscribeConfirm = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
