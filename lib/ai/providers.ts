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
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Define types for better type safety
type ModelId = keyof typeof modelInstance;
type ImageProvider = keyof typeof imageModelInstance;
type ModelTag = 'chat-model' | 'chat-model-reasoning' | 'title-model' | 'artifact-model';

// Helper: Map provider/model id to ai-sdk instance
const modelInstance = {
  // OpenAI
  'gpt-4-turbo-preview': createOpenAI().languageModel('gpt-4-turbo-preview'),
  'gpt-4-turbo': createOpenAI().languageModel('gpt-4-turbo'),
  'gpt-4.5-preview': createOpenAI().languageModel('gpt-4.5-preview'),
  'gpt-4o': createOpenAI().languageModel('gpt-4o'),
  'gpt-4': createOpenAI().languageModel('gpt-4'),
  'gpt-3.5-turbo': createOpenAI().languageModel('gpt-3.5-turbo'),
  // Anthropic
  'claude-4-opus-20250514': createAnthropic().languageModel('claude-4-opus-20250514'),
  'claude-4-sonnet-20250514': createAnthropic().languageModel('claude-4-sonnet-20250514'),
  'claude-3-7-sonnet-20250219': createAnthropic().languageModel('claude-3-7-sonnet-20250219'),
  'claude-3-5-sonnet-latest': createAnthropic().languageModel('claude-3-5-sonnet-latest'),
  'claude-3-5-sonnet-20241022': createAnthropic().languageModel('claude-3-5-sonnet-20241022'),
  'claude-3-5-sonnet-20240620': createAnthropic().languageModel('claude-3-5-sonnet-20240620'),
  'claude-3-5-haiku-latest': createAnthropic().languageModel('claude-3-5-haiku-latest'),
  'claude-3-5-haiku-20241022': createAnthropic().languageModel('claude-3-5-haiku-20241022'),
  'claude-3-opus-latest': createAnthropic().languageModel('claude-3-opus-latest'),
  'claude-3-opus-20240229': createAnthropic().languageModel('claude-3-opus-20240229'),
  'claude-3-sonnet-20240229': createAnthropic().languageModel('claude-3-sonnet-20240229'),
  'claude-3-haiku-20240307': createAnthropic().languageModel('claude-3-haiku-20240307'),
  // Google
  'gemini-1.5-pro': createGoogleGenerativeAI().languageModel('gemini-1.5-pro'),
  'gemini-1.5-pro-latest': createGoogleGenerativeAI().languageModel('gemini-1.5-pro-latest'),
  'gemini-1.5-pro-001': createGoogleGenerativeAI().languageModel('gemini-1.5-pro-001'),
  'gemini-1.5-pro-002': createGoogleGenerativeAI().languageModel('gemini-1.5-pro-002'),
  'gemini-2.0-pro-exp-02-05': createGoogleGenerativeAI().languageModel('gemini-2.0-pro-exp-02-05'),
  'gemini-2.5-pro-preview-05-06': createGoogleGenerativeAI().languageModel('gemini-2.5-pro-preview-05-06'),
  'gemini-2.5-pro-exp-03-25': createGoogleGenerativeAI().languageModel('gemini-2.5-pro-exp-03-25'),
  // Mistral
  'mistral-medium': createMistral().languageModel('mistral-medium'),
  'mistral-small': createMistral().languageModel('mistral-small'),
  'mixtral-8x7b': createMistral().languageModel('mixtral-8x7b'),
  'open-mistral-7b': createMistral().languageModel('open-mistral-7b'),
  'open-mixtral-8x22b': createMistral().languageModel('open-mixtral-8x22b'),
  'mistral-large-latest': createMistral().languageModel('mistral-large-latest'),
  // xAI Grok
  'grok-3': xai('grok-3'),
  'grok-3-mini': xai('grok-3-mini'),
  'grok-2-vision-1212': xai('grok-2-vision-1212'),
  'grok-2-1212': xai('grok-2-1212'),
  // Cohere
  'command-r-plus': createCohere().languageModel('command-r-plus'),
  'command-r': createCohere().languageModel('command-r'),
  'command': createCohere().languageModel('command'),
  'command-nightly': createCohere().languageModel('command-nightly'),
  'command-light': createCohere().languageModel('command-light'),
  'command-light-nightly': createCohere().languageModel('command-light-nightly'),
  // DeepSeek
  'deepseek-chat': createDeepSeek().languageModel('deepseek-chat'),
  'deepseek-coder': createDeepSeek().languageModel('deepseek-coder'),
  'deepseek-reasoner': createDeepSeek().languageModel('deepseek-reasoner'),
  // Perplexity
  'pplx-70b-chat': createPerplexity().languageModel('pplx-70b-chat'),
  'pplx-7b-chat': createPerplexity().languageModel('pplx-7b-chat'),
  'sonar': createPerplexity().languageModel('sonar'),
  'sonar-pro': createPerplexity().languageModel('sonar-pro'),
  'sonar-reasoning': createPerplexity().languageModel('sonar-reasoning'),
  'sonar-reasoning-pro': createPerplexity().languageModel('sonar-reasoning-pro'),
  'sonar-deep-research': createPerplexity().languageModel('sonar-deep-research'),
  // OpenRouter (main models)
  'openai/gpt-3.5-turbo': createOpenRouter().languageModel('openai/gpt-3.5-turbo'),
  'anthropic/claude-3-haiku': createOpenRouter().languageModel('anthropic/claude-3-haiku'),
  'google/gemini-pro': createOpenRouter().languageModel('google/gemini-pro'),
  'mistralai/mistral-large': createOpenRouter().languageModel('mistralai/mistral-large'),
  'cohere/command-r': createOpenRouter().languageModel('cohere/command-r'),
  'perplexity/sonar-medium-online': createOpenRouter().languageModel('perplexity/sonar-medium-online'),
} as const;

// Helper: Map image models by provider
const imageModelInstance = {
  openai: createOpenAI().imageModel('dall-e-3'),
  xai: xai.image('grok-2-image'),
  //  (currently, only these are image-capable)
} as const;

// Tag mapping logic with proper typing
export function getModelByTag(tag: ModelTag, providerOrModelId?: ModelId): LanguageModelV1 {
  if (tag === 'chat-model') {
    // Default to OpenAI GPT-4o, or use selected provider/model
    return providerOrModelId && modelInstance[providerOrModelId] 
      ? modelInstance[providerOrModelId] 
      : modelInstance['gpt-4o'];
  }
  if (tag === 'chat-model-reasoning') {
    // Use best reasoning model (Claude 3 Opus or GPT-4o)
    if (providerOrModelId && modelInstance[providerOrModelId]) {
      return wrapLanguageModel({
        model: modelInstance[providerOrModelId],
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      });
    }
    // Default to Claude 3 Opus with reasoning middleware
    return wrapLanguageModel({
      model: modelInstance['claude-3-opus-latest'],
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    });
  }
  if (tag === 'title-model') {
    return providerOrModelId && modelInstance[providerOrModelId]
      ? modelInstance[providerOrModelId]
      : modelInstance['gpt-4o'];
  }
  if (tag === 'artifact-model') {
    return providerOrModelId && modelInstance[providerOrModelId]
      ? modelInstance[providerOrModelId]
      : modelInstance['gpt-4o'];
  }
  
  // This should never happen with proper typing, but TypeScript requires it
  throw new Error(`Unknown tag: ${tag}`);
}

export function getImageModelByProvider(provider: ImageProvider): ImageModel {
  const model = imageModelInstance[provider];
  if (!model) {
    return imageModelInstance['xai'];
  }
  return model;
}

// Export a myProvider compatible with the old tag-based API
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': getModelByTag('chat-model'),
        'chat-model-reasoning': getModelByTag('chat-model-reasoning'),
        'title-model': getModelByTag('title-model'),
        'artifact-model': getModelByTag('artifact-model'),
        // Also expose all individual models for direct access
        ...modelInstance,
      },
      imageModels: {
        'small-model': getImageModelByProvider('xai'),
        'openai': getImageModelByProvider('openai'),
        'xai': getImageModelByProvider('xai'),
      },
    });