import { create } from "zustand";
import { useEffect } from "react";

interface SelectedModelState {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

export const useSelectedModel = create<SelectedModelState>((set) => ({
  selectedModelId:
    (typeof window !== "undefined" && localStorage.getItem("selectedModelId")) || "",
  setSelectedModelId: (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModelId", id);
      document.cookie = `chat-model=${encodeURIComponent(id)}; path=/; max-age=31536000`;
    }
    set({ selectedModelId: id });
  },
}));

// Sync Zustand and cookie on the client
export function useSyncSelectedModelCookie(selectedModelId: string) {
  useEffect(() => {
    if (typeof document !== "undefined" && selectedModelId) {
      document.cookie = `chat-model=${encodeURIComponent(selectedModelId)}; path=/; max-age=31536000`;
    }
  }, [selectedModelId]);
} 