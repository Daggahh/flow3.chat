import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { ChevronLeft } from "lucide-react";

const PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "mistral", name: "Mistral" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "grok", name: "Grok" },
  { id: "cohere", name: "Cohere" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "perplexity", name: "Perplexity" },
];

export function ApiKeySettings({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<Record<string, string | null>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/keys")
      .then((res) => res.json())
      .then((data) => {
        // Assume data is an array of { provider, encryptedKey }
        const keyMap: Record<string, string | null> = {};
        for (const provider of PROVIDERS) {
          const found = data.find((k: any) => k.provider === provider.id);
          keyMap[provider.id] = found ? "••••••••••••" : null;
        }
        setKeys(keyMap);
      });
  }, []);

  const handleInputChange = (provider: string, value: string) => {
    setInputs((prev) => ({ ...prev, [provider]: value }));
  };

  const handleSave = async (provider: string) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: inputs[provider] }),
      });
      if (!res.ok) throw new Error("Failed to save key");
      setKeys((prev) => ({ ...prev, [provider]: "••••••••••••" }));
      setInputs((prev) => ({ ...prev, [provider]: "" }));
      toast.success("API key saved!");
    } catch (e) {
      toast.error("Failed to save API key");
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleDelete = async (provider: string) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch(`/api/keys?provider=${provider}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete key");
      setKeys((prev) => ({ ...prev, [provider]: null }));
      toast.success("API key deleted!");
    } catch (e) {
      toast.error("Failed to delete API key");
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-0 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="mr-2"
            aria-label="Back to chat"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold flex-1 text-center">
            API Key Settings
          </h2>
          <div className="w-8" /> {/* Spacer for symmetry */}
        </div>
        {/* Description */}
        <div className="px-6 pt-4 pb-2 border-b border-border/50 bg-muted/40 dark:bg-zinc-800/40">
          <p className="text-sm text-muted-foreground mb-1">
            Manage your API keys for all supported AI providers. Keys are{" "}
            <strong>encrypted</strong> before being stored. Only you can decrypt
            and use them.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Add keys for multiple providers to unlock more
            models and features.
          </p>
        </div>
        {/* Provider List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {PROVIDERS.map((provider) => {
            const Icon = useProviderIcon(provider.id);
            return (
              <div
                key={provider.id}
                className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 group border border-border/30"
              >
                <span className="w-7 flex items-center justify-center text-lg">
                  {Icon}
                </span>
                <div className="w-32 font-medium flex items-center gap-1">
                  {provider.name}
                </div>
                <Input
                  type="password"
                  placeholder={`Enter ${provider.name} API key`}
                  value={inputs[provider.id] || ""}
                  onChange={(e) =>
                    handleInputChange(provider.id, e.target.value)
                  }
                  className="flex-1"
                  disabled={loading[provider.id]}
                />
                <Button
                  size="sm"
                  onClick={() => handleSave(provider.id)}
                  disabled={!inputs[provider.id] || loading[provider.id]}
                  className="transition-transform group-hover:scale-105 focus:scale-105"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(provider.id)}
                  disabled={!keys[provider.id] || loading[provider.id]}
                  className="transition-transform group-hover:scale-105 focus:scale-105"
                >
                  Delete
                </Button>
                <span className="ml-2 text-xs text-muted-foreground">
                  {keys[provider.id] ? "Set" : "Not set"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
