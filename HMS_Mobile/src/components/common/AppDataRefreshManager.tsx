import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { focusManager } from "@tanstack/react-query";
import { queryClient } from "../../services/query-client";
import { logger } from "../../utils/logger";

const ACTIVE_REFRESH_INTERVAL_MS = 30_000;

export default function AppDataRefreshManager() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const refreshActiveQueries = () => {
      queryClient
        .refetchQueries({
          type: "active",
        })
        .catch((error) => {
          logger.warn("Automatic data refresh failed", { error });
        });
    };

    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasInactive = appState.current.match(/inactive|background/);
      const isActive = nextState === "active";

      focusManager.setFocused(isActive);
      appState.current = nextState;

      if (wasInactive && isActive) {
        refreshActiveQueries();
      }
    });

    const intervalId = setInterval(() => {
      if (appState.current === "active") {
        refreshActiveQueries();
      }
    }, ACTIVE_REFRESH_INTERVAL_MS);

    focusManager.setFocused(AppState.currentState === "active");

    return () => {
      subscription.remove();
      clearInterval(intervalId);
      focusManager.setFocused(undefined);
    };
  }, []);

  return null;
}
