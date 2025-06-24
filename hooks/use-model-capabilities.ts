import { useMemo } from "react";
import { chatModels, ChatModel } from "@/lib/ai/models";

export type Capability = keyof ChatModel["capabilities"];

export function useModelCapabilities(models: ChatModel[] = chatModels) {
  // Get all unique capabilities
  const allCapabilities = useMemo(() => {
    const caps = new Set<Capability>();
    models.forEach((model) => {
      Object.entries(model.capabilities).forEach(([key, value]) => {
        if (value) caps.add(key as Capability);
      });
    });
    return Array.from(caps);
  }, [models]);

  // Filter models by selected capability
  const filterByCapability = (cap: Capability | null) => {
    if (!cap) return models;
    return models.filter((model) => model.capabilities[cap]);
  };

  return { allCapabilities, filterByCapability };
} 