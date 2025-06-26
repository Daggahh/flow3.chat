import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';
import { createMyProvider } from '@/lib/ai/providers';

export const createImageDocumentHandler = (
  customApiKeys: Record<string, string | undefined> = {},
  modelId = 'image-model'
) =>
  createDocumentHandler<'image'>({
    kind: 'image',
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
      const model = provider.imageModel(modelId);
      const { image } = await experimental_generateImage({
        model,
        prompt: title,
        n: 1,
      });
      draftContent = image.base64;
      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });
      return draftContent;
    },
    onUpdateDocument: async ({ description, dataStream }) => {
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
      const model = provider.imageModel(modelId);
      const { image } = await experimental_generateImage({
        model,
        prompt: description,
        n: 1,
      });
      draftContent = image.base64;
      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });
      return draftContent;
    },
  });

export const imageDocumentHandler = createImageDocumentHandler();
