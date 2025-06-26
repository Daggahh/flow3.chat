import { sheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { createMyProvider } from '@/lib/ai/providers';

export const createSheetDocumentHandler = (
  customApiKeys: Record<string, string | undefined> = {},
  modelId = 'gpt-4o'
) =>
  createDocumentHandler<'sheet'>({
    kind: 'sheet',
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
        system: sheetPrompt,
        prompt: title,
        schema: z.object({
          csv: z.string().describe('CSV data'),
        }),
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'object') {
          const { object } = delta;
          const { csv } = object;
          if (csv) {
            dataStream.writeData({
              type: 'sheet-delta',
              content: csv,
            });
            draftContent = csv;
          }
        }
      }
      dataStream.writeData({
        type: 'sheet-delta',
        content: draftContent,
      });
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
        system: updateDocumentPrompt(document.content, 'sheet'),
        prompt: description,
        schema: z.object({
          csv: z.string(),
        }),
      });
      for await (const delta of fullStream) {
        const { type } = delta;
        if (type === 'object') {
          const { object } = delta;
          const { csv } = object;
          if (csv) {
            dataStream.writeData({
              type: 'sheet-delta',
              content: csv,
            });
            draftContent = csv;
          }
        }
      }
      return draftContent;
    },
  });

export const sheetDocumentHandler = createSheetDocumentHandler();
