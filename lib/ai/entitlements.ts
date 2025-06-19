import type { UserType } from '@/app/(auth)/auth';
import type { SupportedModel } from './providers/types';

interface Entitlements {
  maxMessagesPerDay: number;
  availableModels: Array<SupportedModel>;
  maxImagesPerDay?: number;
  maxTokensPerMessage?: number;
  allowCodeExecution?: boolean;
  allowImageGeneration?: boolean;
  allowChatBranching?: boolean;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account - Limited model access
   */
  guest: {
    maxMessagesPerDay: 20,
    availableModels: [
      // Basic OpenAI models
      'gpt-3.5-turbo',
      // OpenRouter main models (basic)
      'openai/gpt-3.5-turbo',

      // Basic Anthropic models
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',

      // Basic Google models
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',

      // Basic Mistral models
      'mistral-small',
      'mixtral-8x7b',

      // Basic Cohere models
      'command-r',
      'command',

      // Basic DeepSeek models
      'deepseek-chat',
      'deepseek-reasoner',

      // Basic Perplexity models
      'pplx-7b-chat',
      'sonar',

      // OpenRouter main models (basic)
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'mistralai/mistral-large',
      'cohere/command-r',
      'perplexity/sonar-medium-online',
    ],
    maxTokensPerMessage: 4000,
    maxImagesPerDay: 5,
    allowCodeExecution: true,
    allowImageGeneration: true,
    allowChatBranching: false
  },

  /*
   * For users with an account - Full model access
   */
  regular: {
    maxMessagesPerDay: 100,
    availableModels: [
      // All OpenAI models
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',

      // OpenRouter main models (all)
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'mistralai/mistral-large',
      'cohere/command-r',
      'perplexity/sonar-medium-online',

      // All Anthropic models
      'claude-4-opus-20250514',
      'claude-4-sonnet-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-latest',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-haiku-latest',
      'claude-3-opus-latest',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',

      // All Google models
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-2.0-pro-exp-02-05',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.5-pro-exp-03-25',

      // All Mistral models
      'mistral-medium',
      'mistral-small',
      'mixtral-8x7b',
      'open-mistral-7b',
      'open-mixtral-8x22b',
      'mistral-large-latest',

      // xAI Grok
      'grok-3',
      'grok-3-mini',
      'grok-2-vision-1212',
      'grok-2-1212',

      // Cohere
      'command-r-plus',
      'command-r',
      'command',
      'command-nightly',
      'command-light',
      'command-light-nightly',

      // DeepSeek
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-reasoner',

      // Perplexity
      'pplx-70b-chat',
      'pplx-7b-chat',
      'sonar',
      'sonar-pro',
      'sonar-reasoning',
      'sonar-reasoning-pro',
      'sonar-deep-research',
    ],
    maxTokensPerMessage: 8000,
    maxImagesPerDay: 20,
    allowCodeExecution: true,
    allowImageGeneration: true,
    allowChatBranching: true
  },
};
