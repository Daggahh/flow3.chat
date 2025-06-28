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

  console.log('DELETE API Key request:', { provider, userId: session.user.id });

  if (!provider) {
    console.error('Missing provider parameter');
    return new ChatSDKError('bad_request:api_keys', 'Provider parameter is required').toResponse();
  }

  const validProviders = ['openai', 'anthropic', 'google', 'mistral', 'openrouter', 'grok', 'cohere', 'deepseek', 'perplexity'];
  if (!validProviders.includes(provider)) {
    console.error('Invalid provider:', provider);
    return new ChatSDKError('bad_request:api_keys', `Invalid provider: ${provider}`).toResponse();
  }

  try {
    console.log('Attempting to delete API key for provider:', provider);
    await deleteApiKey({
      userId: session.user.id,
      provider: provider as any,
    });

    console.log('Successfully deleted API key for provider:', provider);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return new ChatSDKError('bad_request:api_keys', 'Failed to delete API key').toResponse();
  }
}