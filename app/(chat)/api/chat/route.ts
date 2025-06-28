import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getApiKeysByUserId,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { createMyProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { differenceInSeconds } from 'date-fns';
import { ChatSDKError } from '@/lib/errors';
import { webSearchTool } from '@/lib/ai/tools/web-search';
import { cookies } from 'next/headers';
import { decryptApiKey } from '@/lib/encryption';


export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

// Utility: Check if a model is a Gemini model
const GEMINI_MODELS = [
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro-001',
  'gemini-1.5-pro-002',
  'gemini-2.0-pro-exp-02-05',
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.5-pro-exp-03-25',
  'google/gemini-pro',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
];
function isGeminiModel(modelId: string): boolean {
  return GEMINI_MODELS.includes(modelId);
}

export async function POST(request: Request) {
  console.log('--- /api/chat POST called ---');
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (err) {
    console.error('Failed to parse request body:', err);
    return new ChatSDKError('bad_request:api').toResponse();
  }
  console.log('Parsed requestBody:', requestBody);

  try {
    const { id, message, selectedChatModel, selectedVisibilityType, useWebSearch } =
      requestBody;

    const session = await auth();
    console.log('Session:', session);
    console.log('Web search enabled:', useWebSearch);
    const cookieStore = await cookies();

    // Get all user's API keys
    let customApiKeys: Record<string, string> = {};
    if (session?.user) {
      const userApiKeys = await getApiKeysByUserId(session.user.id);
      for (const keyData of userApiKeys) {
        const decryptedKey = await decryptApiKey(keyData.encryptedKey);
        if (decryptedKey) {
          customApiKeys[keyData.provider] = decryptedKey;
        }
      }
    }
    console.log('customApiKeys:', customApiKeys);
    console.log('selectedChatModel:', selectedChatModel);

    // For Gemini free tier, add default key if user doesn't have one
    if (isGeminiModel(selectedChatModel) && !customApiKeys.google && process.env.GOOGLE_DEFAULT_API_KEY) {
      // Handle rate limiting for free tier
      let guestMessageCount = 0;
      let guestCookie = cookieStore.get('gemini_guest_count');
      if (guestCookie) {
        try {
          const { count, ts } = JSON.parse(guestCookie.value);
          if (Date.now() - ts < 24 * 60 * 60 * 1000) {
            guestMessageCount = count;
          }
        } catch {}
      }
      if (!session?.user && guestMessageCount >= 10) {
        return new ChatSDKError('rate_limit:chat').toResponse();
      }
      if (!session?.user) {
        cookieStore.set('gemini_guest_count', JSON.stringify({ count: guestMessageCount + 1, ts: Date.now() }), {
          httpOnly: true,
          maxAge: 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      customApiKeys.google = process.env.GOOGLE_DEFAULT_API_KEY;
    }

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
        customApiKeys,
        selectedChatModel,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // --- Use new dynamic provider pattern ---
    const provider = createMyProvider({
      openaiKey: customApiKeys.openai,
      geminiKey: customApiKeys.google,
      anthropicKey: customApiKeys.anthropic,
      mistralKey: customApiKeys.mistral,
      cohereKey: customApiKeys.cohere,
      deepseekKey: customApiKeys.deepseek,
      perplexityKey: customApiKeys.perplexity,
      grokKey: customApiKeys.grok,
      openrouterKey: customApiKeys.openrouter,
    });
    const modelInstance = provider.languageModel(selectedChatModel);
    // ------------------------------------------------------

    const stream = createDataStream({
      execute: async (dataStream) => {
        console.log('Initializing model instance for', selectedChatModel, 'with keys:', customApiKeys);
        console.log('Web search tool configuration:', {
          useWebSearch,
          activeTools: useWebSearch
            ? ['webSearch', 'getWeather', 'createDocument', 'updateDocument', 'requestSuggestions']
            : ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions', 'webSearch']
        });
        const result = streamText({
          model: modelInstance,
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            useWebSearch
              ? [
                  'webSearch',
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ]
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'webSearch',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream, customApiKeys, modelId: selectedChatModel }),
            updateDocument: updateDocument({ session, dataStream, customApiKeys, modelId: selectedChatModel }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
              customApiKeys,
              modelId: selectedChatModel,
            }),
            webSearch: webSearchTool,
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    console.error('Unexpected error in /api/chat:', error, (error instanceof Error ? error.stack : undefined));
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== 'assistant') {
      return new Response(emptyDataStream, { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: 'append-message',
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
