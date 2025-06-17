import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/errors';
import { saveApiKey, deleteApiKey } from '@/lib/db/queries';
import { encryptApiKey } from '@/lib/encryption';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatSDKError('unauthorized:api_keys').toResponse();
  }

  try {
    const { provider, apiKey } = await request.json();
    const encryptedValue = await encryptApiKey(apiKey);
    
    const result = await saveApiKey({
      userId: session.user.id,
      provider,
      encryptedKey: encryptedValue,
    });

    return Response.json(result);
  } catch (error) {
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

  if (!provider || !['openai', 'anthropic', 'google', 'mistral'].includes(provider)) {
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }

  try {
    const result = await deleteApiKey({
      userId: session.user.id,
      provider: provider as 'openai' | 'anthropic' | 'google' | 'mistral',
    });

    return Response.json(result);
  } catch (error) {
    return new ChatSDKError('bad_request:api_keys').toResponse();
  }
}
