import { auth } from '@/app/(auth)/auth';
import { getMessageCountByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId');

  if (!userId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter userId is required.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:usage').toResponse();
  }

  // Users can only check their own usage
  if (session.user.id !== userId) {
    return new ChatSDKError('forbidden:usage').toResponse();
  }

  try {
    const messageCount = await getMessageCountByUserId({
      id: userId,
      differenceInHours: 24,
    });

    return Response.json({ messageCount });
  } catch (error) {
    return new ChatSDKError('bad_request:database', 'Failed to get usage data').toResponse();
  }
} 