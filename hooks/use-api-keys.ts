'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db/local';
import { encryptApiKey, decryptApiKey } from '@/lib/encryption';
import { apiKeyProviderEnum } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';

type ApiKeyProvider = typeof apiKeyProviderEnum.enumValues[number];

interface UseApiKeysReturn {
  apiKeys: Map<ApiKeyProvider, string>;
  saveApiKey: (provider: ApiKeyProvider, key: string) => Promise<void>;
  deleteApiKey: (provider: ApiKeyProvider) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useApiKeys(): UseApiKeysReturn {  const [apiKeys, setApiKeys] = useState<Map<ApiKeyProvider, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load API keys from both local and server storage
  useEffect(() => {
    async function loadApiKeys() {
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
        const session = await auth();
        if (session?.user) {
          const response = await fetch('/api/keys');
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
        console.error('Error loading API keys:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadApiKeys();
  }, []);

  const saveApiKey = useCallback(async (provider: ApiKeyProvider, key: string) => {
    try {
      const encryptedKey = await encryptApiKey(key);
      const id = crypto.randomUUID();
      
      // Save to IndexedDB
      await db.api_keys.put({
        id,
        provider,
        encryptedKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false
      });

      // If authenticated, save to server
      const session = await auth();
      if (session?.user) {
        const response = await fetch('/api/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey: key }),
        });

        if (!response.ok) {
          throw new Error('Failed to save API key to server');
        }

        // Mark as synced in IndexedDB
        await db.api_keys.update(id, { synced: true });
      }

      // Update local state
      setApiKeys(prev => new Map(prev).set(provider, key));
        toast.success(`Successfully saved ${provider} API key`);
    } catch (err) {
      console.error('Error saving API key:', err);      toast.error('Failed to save API key');
      throw err;
    }
  }, [toast]);

  const deleteApiKey = useCallback(async (provider: ApiKeyProvider) => {
    try {
      // Delete from IndexedDB
      await db.api_keys.where('provider').equals(provider).delete();

      // If authenticated, delete from server
      const session = await auth();
      if (session?.user) {
        const response = await fetch(`/api/keys?provider=${provider}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete API key from server');
        }
      }

      // Update local state
      setApiKeys(prev => {
        const next = new Map(prev);
        next.delete(provider);
        return next;
      });      toast.success(`Successfully removed ${provider} API key`);
    } catch (err) {
      console.error('Error deleting API key:', err);      toast.error('Failed to delete API key');
      throw err;
    }
  }, [toast]);

  return {
    apiKeys,
    saveApiKey,
    deleteApiKey,
    loading,
    error
  };
}
