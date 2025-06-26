import { smoothStream, streamText } from 'ai';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { createMyProvider } from '@/lib/ai/providers';

export const createTextDocumentHandler = (
  customApiKeys: Record<string, string | undefined> = {},
  modelId = 'gpt-4o'
) =>
  createDocumentHandler<'text'>({
    kind: 'text',
    onCreateDocument: async ({ title, dataStream }) => {
      let draftContent = '';
      // Use new provider pattern
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
      const model = provider.languageModel(modelId);
      const { fullStream } = streamText({
        model,
        system:
          'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
        experimental_transform: smoothStream({ chunking: 'word' }),
        prompt: title,
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'text-delta') {
          const { textDelta } = delta;
          draftContent += textDelta;
          dataStream.writeData({
            type: 'text-delta',
            content: textDelta,
          });
        }
      }
      return draftContent;
    },
    onUpdateDocument: async ({ document, description, dataStream }) => {
      let draftContent = '';
      // Use new provider pattern
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
      const model = provider.languageModel(modelId);
      const { fullStream } = streamText({
        model,
        system: updateDocumentPrompt(document.content, 'text'),
        experimental_transform: smoothStream({ chunking: 'word' }),
        prompt: description,
        experimental_providerMetadata: {
          openai: {
            prediction: {
              type: 'content',
              content: document.content,
            },
          },
        },
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'text-delta') {
          const { textDelta } = delta;
          draftContent += textDelta;
          dataStream.writeData({
            type: 'text-delta',
            content: textDelta,
          });
        }
      }
      return draftContent;
    },
  });

export const textDocumentHandler = createTextDocumentHandler();