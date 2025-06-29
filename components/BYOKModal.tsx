"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { ApiKeyProvider, useApiKeys } from "@/hooks/use-api-keys";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ApiKeyProvider as ApiKeyProviderType } from "@/lib/db/schema";

const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    placeholder: "sk-...",
    helpLink: "https://platform.openai.com/account/api-keys",
    helpText: "Find your API key in the OpenAI dashboard.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    placeholder: "sk-ant-...",
    helpLink: "https://console.anthropic.com/settings/keys",
    helpText: "Find your API key in the Anthropic console.",
  },
  {
    id: "google",
    name: "Google Gemini",
    placeholder: "AIza...",
    helpLink: "https://makersuite.google.com/app/apikey",
    helpText: "Get your API key from Google AI Studio.",
  },
  {
    id: "mistral",
    name: "Mistral",
    placeholder: "mistral-...",
    helpLink: "https://console.mistral.ai/api-keys/",
    helpText: "Find your API key in the Mistral dashboard.",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    placeholder: "or-...",
    helpLink: "https://openrouter.ai/keys",
    helpText: "Get your API key from OpenRouter.",
  },
  {
    id: "grok",
    name: "Grok",
    placeholder: "grok-...",
    helpLink: "https://x.ai/keys",
    helpText: "Get your API key from xAI Grok.",
  },
  {
    id: "cohere",
    name: "Cohere",
    placeholder: "cohere-...",
    helpLink: "https://dashboard.cohere.com/api-keys",
    helpText: "Find your API key in the Cohere dashboard.",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    placeholder: "deepseek-...",
    helpLink: "https://platform.deepseek.com/api-keys",
    helpText: "Get your API key from DeepSeek.",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    placeholder: "pplx-...",
    helpLink: "https://www.perplexity.ai/developer",
    helpText: "Get your API key from Perplexity.",
  },
];

export function BYOKModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    apiKeys,
    saveApiKey,
    loading,
    editing,
    handleEdit,
    handleCancelEdit,
    deleteApiKey,
  } = useApiKeys();
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].id);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset input when provider changes or modal opens
  React.useEffect(() => {
    if (apiKeys.has(selectedProvider as any)) {
      setInput("••••••••");
    } else {
      setInput("");
    }
  }, [selectedProvider, isOpen, apiKeys]);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveApiKey(selectedProvider as any, input);
      setInput("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If the user starts typing, replace the masked value
    setInput(e.target.value);
  };

  // Responsive: vertical tab list on desktop, horizontal on mobile
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 bg-white dark:bg-zinc-900 rounded-xl shadow-xl flex flex-col md:flex-row overflow-visible animate-in fade-in zoom-in">
        <DialogTitle asChild>
          <VisuallyHidden>Add or Update API Key</VisuallyHidden>
        </DialogTitle>
        {/* Provider Tab List */}
        <nav
          className="md:w-56 w-full md:h-[500px] h-16 flex-row flex md:flex-col flex-nowrap md:overflow-y-auto overflow-x-auto border-r border-border/50 bg-muted/40 dark:bg-zinc-800/40 shrink-0"
          style={{ minHeight: 64, maxHeight: 500 }}
          aria-label="AI Providers"
        >
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              className={`flex items-center gap-2 px-4 py-3 md:py-2 md:px-4 text-sm font-medium transition-colors whitespace-nowrap md:w-full md:rounded-none rounded-lg focus:outline-none focus:bg-primary/10 ${
                selectedProvider === provider.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/60 dark:hover:bg-zinc-800/60"
              }`}
              onClick={() => setSelectedProvider(provider.id)}
              aria-selected={selectedProvider === provider.id}
              tabIndex={0}
              type="button"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {useProviderIcon(provider.id)}
              </span>
              <span>{provider.name}</span>
            </button>
          ))}
        </nav>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-lg font-bold mb-2">Add or Update API Key</h2>
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium" htmlFor="api-key-input">
                {provider?.name} API Key
              </label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {provider?.helpLink && (
                  <a
                    href={provider.helpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline ml-2"
                  >
                    Get API key
                  </a>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-pointer">
                      <InfoIcon className="w-4 h-4 mr-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{provider?.helpText}</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Input
              id="api-key-input"
              type="password"
              placeholder={provider?.placeholder}
              value={input}
              onChange={handleInputChange}
              disabled={
                (!editing[selectedProvider as ApiKeyProviderType] &&
                  apiKeys.has(selectedProvider as any)) ||
                saving ||
                loading
              }
              className="w-full"
              autoFocus
            />
            {apiKeys.has(selectedProvider as any) &&
            !editing[selectedProvider as ApiKeyProviderType] ? (
              <Button
                variant="outline"
                onClick={() =>
                  handleEdit(selectedProvider as ApiKeyProviderType)
                }
                className="w-full"
              >
                Edit
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!input || saving || loading}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Key"}
              </Button>
            )}
            {apiKeys.has(selectedProvider as any) && (
              <Button
                variant="outline"
                onClick={() => deleteApiKey(selectedProvider as any)}
                disabled={saving || loading}
                className="w-full"
              >
                Delete
              </Button>
            )}
            {editing[selectedProvider as ApiKeyProviderType] && (
              <Button
                variant="ghost"
                onClick={() =>
                  handleCancelEdit(selectedProvider as ApiKeyProviderType)
                }
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
