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

  // Filter models by ALL selected capabilities (AND logic)
  const filterByCapabilities = (caps: Capability[] | null) => {
    if (!caps || caps.length === 0) return models;
    return models.filter((model) =>
      caps.every((cap) => model.capabilities[cap])
    );
  };

  return { allCapabilities, filterByCapabilities };
} 