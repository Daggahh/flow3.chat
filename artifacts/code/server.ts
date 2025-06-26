import { z } from 'zod';
import { streamObject } from 'ai';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { createMyProvider } from '@/lib/ai/providers';

export const createCodeDocumentHandler = (
  customApiKeys: Record<string, string | undefined> = {},
  modelId = 'gpt-4o'
) =>
  createDocumentHandler<'code'>({
    kind: 'code',
    onCreateDocument: async ({ title, dataStream }) => {
      let draftContent = '';
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
      const { fullStream } = streamObject({
        model,
        system: codePrompt,
        prompt: title,
        schema: z.object({
          code: z.string(),
        }),
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'object') {
          const { object } = delta;
          const { code } = object;
          if (code) {
            dataStream.writeData({
              type: 'code-delta',
              content: code ?? '',
            });
            draftContent = code;
          }
        }
      }
      return draftContent;
    },
    onUpdateDocument: async ({ document, description, dataStream }) => {
      let draftContent = '';
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
      const { fullStream } = streamObject({
        model,
        system: updateDocumentPrompt(document.content, 'code'),
        prompt: description,
        schema: z.object({
          code: z.string(),
        }),
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'object') {
          const { object } = delta;
          const { code } = object;
          if (code) {
            dataStream.writeData({
              type: 'code-delta',
              content: code ?? '',
            });
            draftContent = code;
          }
        }
      }
      return draftContent;
    },
  });

export const codeDocumentHandler = createCodeDocumentHandler();
