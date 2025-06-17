import { eq } from 'drizzle-orm';
import { db } from '../index';
import { apiKey } from '../schema';
import type { ApiKeyProvider } from '../schema';

interface SaveApiKeyParams {
  userId: string;
  provider: ApiKeyProvider;
  encryptedKey: string;
}

export async function saveApiKey({
  userId,
  provider,
  encryptedKey,
}: SaveApiKeyParams) {
  return await db
    .insert(apiKey)
    .values({
      userId,
      provider,
      encryptedKey,
    })
    .onConflictDoUpdate({
      target: [apiKey.userId, apiKey.provider],
      set: { encryptedKey, updatedAt: new Date() },
    })
    .returning();
}

export async function deleteApiKey({
  userId,
  provider,
}: {
  userId: string;
  provider: ApiKeyProvider;
}) {
  return await db
    .delete(apiKey)
    .where(eq(apiKey.userId, userId) && eq(apiKey.provider, provider))
    .returning();
}

export async function getApiKeys(userId: string) {
  return await db
    .select()
    .from(apiKey)
    .where(eq(apiKey.userId, userId));
}

export async function getApiKeyByProvider({
  userId,
  provider,
}: {
  userId: string;
  provider: ApiKeyProvider;
}) {
  const result = await db
    .select()
    .from(apiKey)
    .where(eq(apiKey.userId, userId) && eq(apiKey.provider, provider));
  
  return result[0];
}
