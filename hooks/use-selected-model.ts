import { create } from "zustand";
import { useEffect } from "react";

interface SelectedModelState {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
}

// Default models by user type
const DEFAULT_MODELS = {
  regular: "gemini-2.5-flash",
  guest: "gemini-1.5-flash",
} as const;

export const useSelectedModel = create<SelectedModelState>((set) => ({
  selectedModelId: (() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedModelId");
      if (stored) return stored;
      
      // Try to determine user type from session or default to guest
      const userType = localStorage.getItem("userType") || "guest";
      const defaultModel = DEFAULT_MODELS[userType as keyof typeof DEFAULT_MODELS] || DEFAULT_MODELS.guest;
      
      // Set default if nothing is stored
      localStorage.setItem("selectedModelId", defaultModel);
      return defaultModel;
    }
    return DEFAULT_MODELS.guest;
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
      const currentCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('chat-model='));
      
      const cookieValue = `chat-model=${encodeURIComponent(selectedModelId)}; path=/; max-age=31536000`;
      
      // Only update cookie if it's different
      if (!currentCookie || currentCookie !== `chat-model=${encodeURIComponent(selectedModelId)}`) {
        document.cookie = cookieValue;
      }
    }
  }, [selectedModelId]);
} 