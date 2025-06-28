import { create } from "zustand";
import { useEffect } from "react";

interface SelectedModelState {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

const DEFAULT_MODEL = "gemini-2.5-flash";

export const useSelectedModel = create<SelectedModelState>((set) => ({
  selectedModelId: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedModelId");
      if (stored) return stored;
      // Set default if nothing is stored
      localStorage.setItem("selectedModelId", DEFAULT_MODEL);
      return DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  })(),
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