import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  LanguageModelV1,
  ImageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createPerplexity } from '@ai-sdk/perplexity';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { chatModels } from './models';

export function createMyProvider({
  openaiKey,
  geminiKey,
  anthropicKey,
  mistralKey,
  cohereKey,
  deepseekKey,
  perplexityKey,
  grokKey,
  openrouterKey,
}: {
  openaiKey?: string,
  geminiKey?: string,
  anthropicKey?: string,
  mistralKey?: string,
  cohereKey?: string,
  deepseekKey?: string,
  perplexityKey?: string,
  grokKey?: string,
  openrouterKey?: string,
}) {
  const languageModels: Record<string, any> = {};
  for (const model of chatModels) {
    let instance;
    switch (model.provider) {
      case 'openai':
        instance = openaiKey
          ? createOpenAI({ apiKey: openaiKey }).languageModel(model.id)
          : createOpenAI().languageModel(model.id);
        break;
      case 'google':
        instance = geminiKey
          ? createGoogleGenerativeAI({ apiKey: geminiKey }).languageModel(model.id)
          : createGoogleGenerativeAI().languageModel(model.id);
        break;
      case 'anthropic':
        instance = anthropicKey
          ? createAnthropic({ apiKey: anthropicKey }).languageModel(model.id)
          : createAnthropic().languageModel(model.id);
        break;
      case 'mistral':
        instance = mistralKey
          ? createMistral({ apiKey: mistralKey }).languageModel(model.id)
          : createMistral().languageModel(model.id);
        break;
      case 'cohere':
        instance = cohereKey
          ? createCohere({ apiKey: cohereKey }).languageModel(model.id)
          : createCohere().languageModel(model.id);
        break;
      case 'deepseek':
        instance = deepseekKey
          ? createDeepSeek({ apiKey: deepseekKey }).languageModel(model.id)
          : createDeepSeek().languageModel(model.id);
        break;
      case 'perplexity':
        instance = perplexityKey
          ? createPerplexity({ apiKey: perplexityKey }).languageModel(model.id)
          : createPerplexity().languageModel(model.id);
        break;
      case 'grok':
        instance = grokKey
          ? xai(model.id)
          : xai(model.id);
        break;
      case 'openrouter':
        instance = openrouterKey
          ? createOpenRouter({ apiKey: openrouterKey }).languageModel(model.id)
          : createOpenRouter().languageModel(model.id);
        break;
      default:
        continue;
    }
    languageModels[model.id] = instance;
  }

  // Example: Add image models (fallback to OpenAI DALL·E)
  const imageModels = {
    'image-model': openaiKey
      ? createOpenAI({ apiKey: openaiKey }).imageModel('dall-e-3')
      : createOpenAI().imageModel('dall-e-3'),
    // Add more as needed
  };

  return customProvider({ languageModels, imageModels });
}