import type { UserType } from '@/app/(auth)/auth';
import { chatModels } from './models';
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

// Optionally, generate availableModels dynamically from chatModels for 'regular' users
const allModelIds = chatModels.map(m => m.id) as SupportedModel[];

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account - Limited model access
   */
  guest: {
    maxMessagesPerDay: 10,
    availableModels: [
      // Keep a curated subset for guests, or use allModelIds for all
      'gpt-3.5-turbo',
      'openai/gpt-3.5-turbo',
      'claude-3-haiku-20240307',
      'claude-3-sonnet-20240229',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'mistral-small',
      'mixtral-8x7b',
      'command-r',
      'command',
      'deepseek-chat',
      'deepseek-reasoner',
      'pplx-7b-chat',
      'sonar',
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
    maxMessagesPerDay: 20,
    availableModels: allModelIds, // All models for regular users
    maxTokensPerMessage: 8000,
    maxImagesPerDay: 20,
    allowCodeExecution: true,
    allowImageGeneration: true,
    allowChatBranching: true
  },
};
