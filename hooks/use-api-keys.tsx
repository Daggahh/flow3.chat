"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { db } from "@/lib/db/local";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";
import { apiKeyProviderEnum } from "@/lib/db/schema";
import { useSession } from "next-auth/react";

export type ApiKeyProvider = typeof apiKeyProviderEnum.enumValues[number];

interface ApiKeyContextType {
  apiKeys: Map<ApiKeyProvider, string>;
  loading: boolean;
  error: Error | null;
  saveApiKey: (provider: ApiKeyProvider, key: string) => Promise<void>;
  deleteApiKey: (provider: ApiKeyProvider) => Promise<void>;
  refreshApiKeys: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<Map<ApiKeyProvider, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      // Load from IndexedDB first
      const localKeys = await db.api_keys.toArray();
      const decryptedKeys = new Map<ApiKeyProvider, string>();
      for (const key of localKeys) {
        const decrypted = await decryptApiKey(key.encryptedKey);
        if (decrypted) {
          decryptedKeys.set(key.provider as ApiKeyProvider, decrypted);
        }
      }
      // If authenticated, merge with server keys
      if (session?.user) {
        const response = await fetch("/api/keys");
        if (response.ok) {
          const serverKeys = await response.json();
          for (const key of serverKeys) {
            const decrypted = await decryptApiKey(key.encryptedKey);
            if (decrypted) {
              decryptedKeys.set(key.provider as ApiKeyProvider, decrypted);
            }
          }
        }
      }
      setApiKeys(decryptedKeys);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    refreshApiKeys();
    // Optionally, listen for storage events to auto-refresh
    // window.addEventListener('storage', refreshApiKeys);
    // return () => window.removeEventListener('storage', refreshApiKeys);
  }, [refreshApiKeys]);

  const saveApiKey = useCallback(async (provider: ApiKeyProvider, key: string) => {
    try {
      setLoading(true);
      const encryptedKey = await encryptApiKey(key);
      const id = crypto.randomUUID();
      // Save to IndexedDB
      await db.api_keys.put({
        id,
        provider,
        encryptedKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false,
      });
      // If authenticated, save to server
      if (session?.user) {
        const response = await fetch("/api/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, apiKey: key }),
        });
        if (!response.ok) {
          throw new Error("Failed to save API key to server");
        }
        // Mark as synced in IndexedDB
        await db.api_keys.update(id, { synced: true });
      }
      await refreshApiKeys();
      toast.success(`Successfully saved ${provider} API key`);
    } catch (err) {
      toast.error("Failed to save API key");
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user, refreshApiKeys]);

  const deleteApiKey = useCallback(async (provider: ApiKeyProvider) => {
    try {
      setLoading(true);
      // Delete from IndexedDB
      await db.api_keys.where("provider").equals(provider).delete();
      // If authenticated, delete from server
      if (session?.user) {
        const response = await fetch(`/api/keys?provider=${provider}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete API key from server");
        }
      }
      await refreshApiKeys();
      toast.success(`Successfully removed ${provider} API key`);
    } catch (err) {
      toast.error("Failed to delete API key");
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user, refreshApiKeys]);

  return (
    <ApiKeyContext.Provider
      value={{ apiKeys, loading, error, saveApiKey, deleteApiKey, refreshApiKeys }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const ctx = useContext(ApiKeyContext);
  if (ctx) return ctx;
  // fallback: legacy hook logic (for backward compatibility)
  // ... (optional: you can throw or warn here)
  throw new Error("useApiKeys must be used within an ApiKeyProvider");
}