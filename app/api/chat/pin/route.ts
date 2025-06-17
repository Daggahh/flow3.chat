import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/index';
import { chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId } = await request.json();

    if (!chatId) {
      return new NextResponse('Chat ID is required', { status: 400 });
    }

    // Get the chat to verify ownership
    const [existingChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId));

    if (!existingChat || existingChat.userId !== session.user.id) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Toggle pin status
    await db
      .update(chat)
      .set({ isPinned: !existingChat.isPinned })
      .where(eq(chat.id, chatId));

    return NextResponse.json({ success: true, isPinned: !existingChat.isPinned });
  } catch (error) {
    console.error('Error pinning chat:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
