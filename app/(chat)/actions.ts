'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { createMyProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
  customApiKeys,
  selectedChatModel,
}: {
  message: UIMessage;
  customApiKeys?: Record<string, string>;
  selectedChatModel: string;
}) {
  const provider = createMyProvider({
    openaiKey: customApiKeys?.openai,
    geminiKey: customApiKeys?.google,
    anthropicKey: customApiKeys?.anthropic,
    mistralKey: customApiKeys?.mistral,
    cohereKey: customApiKeys?.cohere,
    deepseekKey: customApiKeys?.deepseek,
    perplexityKey: customApiKeys?.perplexity,
    grokKey: customApiKeys?.grok,
    openrouterKey: customApiKeys?.openrouter,
  });
  const model = provider.languageModel(selectedChatModel);
  const { text: title } = await generateText({
    model,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
