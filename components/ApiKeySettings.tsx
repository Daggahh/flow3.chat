import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { ChevronLeft } from "lucide-react";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ApiKeyProvider } from "@/lib/db/schema";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import type { UserType } from "@/app/(auth)/auth";

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

export function ApiKeySettings({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    apiKeys,
    loading,
    saveApiKey,
    deleteApiKey,
    editing,
    handleEdit,
    handleCancelEdit,
  } = useApiKeys();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [messageCount, setMessageCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen) {
      // Prefill inputs with a masked value if a key is set
      const newInputs: Record<string, string> = {};
      PROVIDERS.forEach((provider) => {
        if (apiKeys.has(provider.id as any)) {
          newInputs[provider.id] = "••••••••";
        } else {
          newInputs[provider.id] = "";
        }
      });
      setInputs(newInputs);
    }
  }, [isOpen, apiKeys]);

  // Fetch message count when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      setLoadingUsage(true);
      fetch(`/api/usage?userId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setMessageCount(data.messageCount || 0);
        })
        .catch(() => {
          setMessageCount(0);
        })
        .finally(() => {
          setLoadingUsage(false);
        });
    }
  }, [isOpen, session?.user?.id]);

  const handleInputChange = useCallback((provider: string, value: string) => {
    setInputs((prev) => ({ ...prev, [provider]: value }));
  }, []);

  const handleSave = useCallback(
    async (provider: string) => {
      setSaving((prev) => ({ ...prev, [provider]: true }));
      try {
        await saveApiKey(provider as any, inputs[provider]);
        setInputs((prev) => ({ ...prev, [provider]: "" }));
      } catch (e) {
        // toast handled in context
      } finally {
        setSaving((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [saveApiKey, inputs]
  );

  const handleDelete = useCallback(
    async (provider: string) => {
      setSaving((prev) => ({ ...prev, [provider]: true }));
      try {
        await deleteApiKey(provider as any);
      } catch (e) {
        // toast handled in context
      } finally {
        setSaving((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [deleteApiKey]
  );

  const handleEditClick = useCallback(
    (provider: string) => {
      handleEdit(provider as ApiKeyProvider);
    },
    [handleEdit]
  );

  const handleCancelEditClick = useCallback(
    (provider: string) => {
      handleCancelEdit(provider as ApiKeyProvider);
    },
    [handleCancelEdit]
  );

  // User info and message limit
  const user = session?.user;
  const isGuest = user?.email?.startsWith("guest-");
  const userType: UserType = isGuest ? "guest" : "regular";
  const entitlements = entitlementsByUserType[userType];
  const messageLimit = entitlements.maxMessagesPerDay;
  const messagesUsed = loadingUsage ? 0 : messageCount;

  // Memoize user info
  const userInfo = useMemo(
    () => ({
      image:
        user?.image || `https://avatar.vercel.sh/${user?.email || "guest"}`,
      email: user?.email || "Guest",
      userType,
    }),
    [user?.image, user?.email, userType]
  );

  // Memoize message limit info
  const messageLimitInfo = useMemo(
    () => ({
      limit: messageLimit,
      used: messagesUsed,
      loading: loadingUsage,
      isGuest,
    }),
    [messageLimit, messagesUsed, loadingUsage, isGuest]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-white dark:bg-zinc-900 rounded-xl shadow-xl flex flex-col md:flex-row overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in">
        <DialogTitle asChild>
          <VisuallyHidden>API Key Settings</VisuallyHidden>
        </DialogTitle>
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-muted/40 dark:bg-zinc-800/40 border-r border-border/50 flex flex-col items-center py-8 px-6 gap-6 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <Image
              src={userInfo.image}
              alt={userInfo.email}
              width={56}
              height={56}
              className="rounded-full border border-border"
            />
            <div className="font-semibold text-base truncate max-w-[180px]">
              {userInfo.email}
            </div>
            <div className="text-xs text-muted-foreground">
              {userInfo.userType} user
            </div>
          </div>
          <div className="w-full flex flex-col items-center bg-white dark:bg-zinc-900 rounded-lg border border-border/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Message Limit
            </div>
            <div className="text-2xl font-bold">
              {messageLimitInfo.loading
                ? "..."
                : `${messageLimitInfo.used} / ${messageLimitInfo.limit}`}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              {messageLimitInfo.isGuest
                ? `Free Gemini models: ${messageLimitInfo.limit} messages/day. Sign in for more.`
                : `Free Gemini models: ${messageLimitInfo.limit} messages/day. Add your own API key for unlimited usage.`}
            </div>
          </div>
        </aside>
        {/* Main area */}
        <main className="flex-1 flex flex-col min-h-[300px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <div />
            <h2 className="text-lg font-bold flex-1 text-center">
              API Key Settings
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-2"
              aria-label="Back to chat"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          {/* Description */}
          <div className="px-6 pt-4 pb-2 border-b border-border/50 bg-muted/40 dark:bg-zinc-800/40">
            <p className="text-sm text-muted-foreground mb-1">
              Manage your API keys for all supported AI providers. Keys are{" "}
              <strong>encrypted</strong> before being stored. Only you can
              decrypt and use them.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Add keys for multiple providers to unlock
              more models and features.
            </p>
          </div>
          {/* Provider List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar min-h-0">
            {PROVIDERS.map((provider) => {
              const Icon = useProviderIcon(provider.id);
              const isSet = apiKeys.has(provider.id as any);
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
                    disabled={
                      (!editing[provider.id as ApiKeyProvider] &&
                        apiKeys.has(provider.id as any)) ||
                      saving[provider.id] ||
                      loading
                    }
                  />
                  {apiKeys.has(provider.id as any) &&
                  !editing[provider.id as ApiKeyProvider] ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(provider.id)}
                      className="transition-transform group-hover:scale-105 focus:scale-105"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSave(provider.id)}
                      disabled={
                        !inputs[provider.id] || saving[provider.id] || loading
                      }
                      className="transition-transform group-hover:scale-105 focus:scale-105"
                    >
                      Save
                    </Button>
                  )}
                  {apiKeys.has(provider.id as any) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(provider.id)}
                      disabled={saving[provider.id] || loading}
                      className="transition-transform group-hover:scale-105 focus:scale-105"
                    >
                      Delete
                    </Button>
                  )}
                  {editing[provider.id as ApiKeyProvider] && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelEditClick(provider.id)}
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {isSet ? "Set" : "Not set"}
                  </span>
                </div>
              );
            })}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
