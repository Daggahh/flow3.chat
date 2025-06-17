"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { syncManager } from "@/lib/sync";

type SyncContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSync: number;
};

const SyncContext = createContext<SyncContextType>({
  isOnline: true,
  isSyncing: false,
  pendingSync: 0,
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncState, setSyncState] = useState<SyncContextType>({
    isOnline: true,
    isSyncing: false,
    pendingSync: 0,
  });

  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <SyncContext.Provider value={syncState}>{children}</SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
