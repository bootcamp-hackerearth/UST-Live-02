import { useEffect, useState } from "react";
import {
  isOffline,
  subscribeOfflineStatus,
} from "../services/offline-status.service";

export default function useOfflineStatus() {
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => subscribeOfflineStatus(setOffline), []);

  return offline;
}
