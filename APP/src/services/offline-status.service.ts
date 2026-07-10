type OfflineListener = (offline: boolean) => void;

let offline = false;
const listeners = new Set<OfflineListener>();

export const isOffline = () => offline;

export const setOfflineStatus = (nextOffline: boolean) => {
  if (offline === nextOffline) {
    return;
  }

  offline = nextOffline;
  listeners.forEach((listener) => listener(offline));
};

export const subscribeOfflineStatus = (listener: OfflineListener) => {
  listeners.add(listener);
  listener(offline);

  return () => {
    listeners.delete(listener);
  };
};
