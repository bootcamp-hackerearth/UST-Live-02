const clearCallbacks = new Set<() => void>();

export const registerCacheClear = (callback: () => void) => {
  clearCallbacks.add(callback);

  return () => {
    clearCallbacks.delete(callback);
  };
};

export const clearServiceCaches = () => {
  clearCallbacks.forEach((callback) => callback());
};
