import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/errors';
import { saveApiKey, deleteApiKey, getApiKeysByUserId } from '@/lib/db/queries';
import { encryptApiKey } from '@/lib/encryption';

// Add GET handler to fetch user's API keys
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError('unauthorized:api_keys').toResponse();
  }

  try {
    const apiKeys = await getApiKeysByUserId(session.user.id);
    return Response.json(apiKeys);
  } catch (error) {
    console.error('API Keys Fetch Error:', error);
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError('unauthorized:api_keys').toResponse();
  }

  try {
    const { provider, apiKey } = await request.json();
    console.log('Saving API key:', { provider, apiKey, userId: session.user.id });
    const encryptedValue = await encryptApiKey(apiKey);
    const result = await saveApiKey({
      userId: session.user.id,
      provider,
      encryptedKey: encryptedValue,
    });
    console.log('Save result:', result);
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('API Key Save Error:', error);
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError('unauthorized:api_keys').toResponse();
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (!provider || !['openai', 'anthropic', 'google', 'mistral', 'openrouter', 'grok', 'cohere', 'deepseek', 'perplexity'].includes(provider)) {
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }

  try {
    const result = await deleteApiKey({
      userId: session.user.id,
      provider: provider as any,
    });

    return Response.json(result);
  } catch (error) {
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }
}