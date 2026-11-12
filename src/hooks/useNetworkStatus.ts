"use client";

import { useEffect, useState } from "react";

export interface NetworkStatusState {
  isOnline: boolean;
  justReconnected: boolean;
}

export function useNetworkStatus(): NetworkStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    let reconnectTimer: number | null = null;

    const handleOffline = () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      setJustReconnected(false);
      setIsOnline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      reconnectTimer = window.setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isOnline, justReconnected };
}
