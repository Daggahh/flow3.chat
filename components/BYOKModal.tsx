"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { toast } from "sonner";

const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    placeholder: "sk-...",
    helpText: "Find your API key in the OpenAI dashboard",
    helpLink: "https://platform.openai.com/account/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    placeholder: "sk-ant-...",
    helpText: "Find your API key in the Anthropic console",
    helpLink: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    name: "Google AI",
    placeholder: "AIza...",
    helpText: "Get your API key from Google AI Studio",
    helpLink: "https://makersuite.google.com/app/apikey",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    placeholder: "sk-...",
    helpText: "Find your API key in the Mistral dashboard",
    helpLink: "https://console.mistral.ai/api-keys/",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    placeholder: "or-...",
    helpText: "Get your OpenRouter API key",
    helpLink: "https://openrouter.ai/keys",
  },
  {
    id: "grok",
    name: "Grok (xAI)",
    placeholder: "...",
    helpText: "Get your Grok API key from xAI",
    helpLink: "https://x.ai/",
  },
  {
    id: "cohere",
    name: "Cohere",
    placeholder: "...",
    helpText: "Get your Cohere API key",
    helpLink: "https://dashboard.cohere.com/api-keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    placeholder: "...",
    helpText: "Get your DeepSeek API key",
    helpLink: "https://platform.deepseek.com/api-keys",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    placeholder: "...",
    helpText: "Get your Perplexity API key",
    helpLink: "https://www.perplexity.ai/settings/api",
  },
];

export function BYOKModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(PROVIDERS[0].id);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(PROVIDERS[0].id);
      setInputs({});
    }
  }, [isOpen]);

  const handleInputChange = (provider: string, value: string) => {
    setInputs((prev) => ({ ...prev, [provider]: value }));
  };

  const handleSave = async (provider: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: inputs[provider] }),
      });
      if (!res.ok) throw new Error("Failed to save key");
      toast.success("API key saved!");
      onClose();
    } catch (e) {
      toast.error("Failed to save API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Add or Update API Key</DialogTitle>
          <DialogDescription>
            Bring your own key (BYOK) for any supported provider. Keys are
            encrypted and only you can use them.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-muted/40 rounded-full overflow-x-auto">
            {PROVIDERS.map((provider) => (
              <TabsTrigger
                key={provider.id}
                value={provider.id}
                className="px-2 py-1.5 text-xs sm:text-sm font-medium rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all whitespace-nowrap flex items-center gap-1"
              >
                {useProviderIcon(provider.id)}
                {provider.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {PROVIDERS.map((provider) => (
            <TabsContent
              key={provider.id}
              value={provider.id}
              className="mt-6 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={`${provider.id}-key`} className="font-medium">
                    {provider.name} API Key
                  </label>
                  <a
                    href={provider.helpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Get API key
                  </a>
                </div>
                <Input
                  id={`${provider.id}-key`}
                  type="password"
                  placeholder={provider.placeholder}
                  value={inputs[provider.id] || ""}
                  onChange={(e) =>
                    handleInputChange(provider.id, e.target.value)
                  }
                  className="bg-muted/40 border-border"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {provider.helpText}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSave(provider.id)}
                  disabled={!inputs[provider.id] || loading}
                  className="bg-primary text-primary-foreground"
                >
                  Save
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
