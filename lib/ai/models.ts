import { SupportedModel, ProviderType } from './providers/types';

export const DEFAULT_CHAT_MODEL: SupportedModel = 'gpt-4-turbo-preview';

export interface ChatModel {
  id: SupportedModel;
  name: string;
  description: string;
  maxTokens?: number;
  contextWindow: number;
  costPer1kTokens: number;
  provider: ProviderType;
  capabilities: {
    chat: boolean;
    imageGeneration?: boolean;
    imageUnderstanding?: boolean;
    codeCompletion?: boolean;
  };
}

export const chatModels: Array<ChatModel> = [
  // OpenAI Models
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo Preview',
    description: 'Most capable GPT-4 model, great for tasks requiring advanced reasoning',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'openai',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'OpenAI GPT-4 Turbo',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'openai',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    description: 'OpenAI GPT-4.5 Preview',
    contextWindow: 128000,
    costPer1kTokens: 0.02,
    provider: 'openai',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI GPT-4o, multimodal and fast',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    provider: 'openai',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most reliable GPT-4 model',
    contextWindow: 8192,
    costPer1kTokens: 0.03,
    provider: 'openai',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    contextWindow: 16385,
    costPer1kTokens: 0.0015,
    provider: 'openai',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  // Anthropic Models
  {
    id: 'claude-4-opus-20250514',
    name: 'Claude 4 Opus',
    description: 'Most advanced Claude model for complex reasoning',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-4-sonnet-20250514',
    name: 'Claude 4 Sonnet',
    description: 'Balanced Claude 4 model for general tasks',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    description: 'Latest Claude 3.7 Sonnet model',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Claude 3.5 Sonnet (Latest)',
    description: 'Latest Claude 3.5 Sonnet model',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (2024-10-22)',
    description: 'Claude 3.5 Sonnet model released 2024-10-22',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet (2024-06-20)',
    description: 'Claude 3.5 Sonnet model released 2024-06-20',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku (Latest)',
    description: 'Latest Claude 3.5 Haiku model',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.0003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku (2024-10-22)',
    description: 'Claude 3.5 Haiku model released 2024-10-22',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.0003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-opus-latest',
    name: 'Claude 3 Opus (Latest)',
    description: 'Latest Claude 3 Opus model',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus (2024-02-29)',
    description: 'Claude 3 Opus model released 2024-02-29',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet (2024-02-29)',
    description: 'Claude 3 Sonnet model released 2024-02-29',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku (2024-03-07)',
    description: 'Claude 3 Haiku model released 2024-03-07',
    maxTokens: 4096,
    contextWindow: 200000,
    costPer1kTokens: 0.0003,
    provider: 'anthropic',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  // Google Models (fully synchronized)
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable Google model with advanced reasoning',
    contextWindow: 1000000,
    costPer1kTokens: 0.0025,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro (Latest)',
    description: 'Latest Gemini 1.5 Pro model',
    contextWindow: 1000000,
    costPer1kTokens: 0.0025,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-1.5-pro-001',
    name: 'Gemini 1.5 Pro 001',
    description: 'Gemini 1.5 Pro model version 001',
    contextWindow: 1000000,
    costPer1kTokens: 0.0025,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-1.5-pro-002',
    name: 'Gemini 1.5 Pro 002',
    description: 'Gemini 1.5 Pro model version 002',
    contextWindow: 1000000,
    costPer1kTokens: 0.0025,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-2.0-pro-exp-02-05',
    name: 'Gemini 2.0 Pro Experimental',
    description: 'Next-gen experimental model with enhanced capabilities',
    contextWindow: 1000000,
    costPer1kTokens: 0.005,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview',
    description: 'Latest preview of Gemini 2.5 Pro model',
    contextWindow: 1000000,
    costPer1kTokens: 0.01,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  {
    id: 'gemini-2.5-pro-exp-03-25',
    name: 'Gemini 2.5 Pro Experimental (2024-03-25)',
    description: 'Gemini 2.5 Pro experimental model released 2024-03-25',
    contextWindow: 1000000,
    costPer1kTokens: 0.01,
    provider: 'google',
    capabilities: {
      chat: true,
      imageUnderstanding: true,
      codeCompletion: true
    }
  },
  // Mistral Models
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    description: 'Balanced performance and efficiency',
    contextWindow: 32768,
    costPer1kTokens: 0.002,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    description: 'Fast and efficient model',
    contextWindow: 32768,
    costPer1kTokens: 0.0002,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    description: 'Open source mixture of experts model',
    contextWindow: 32768,
    costPer1kTokens: 0.0004,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'open-mistral-7b',
    name: 'Open Mistral 7B',
    description: 'Open Mistral 7B model',
    contextWindow: 32768,
    costPer1kTokens: 0.0002,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'open-mixtral-8x22b',
    name: 'Open Mixtral 8x22B',
    description: 'Open Mixtral 8x22B model',
    contextWindow: 32768,
    costPer1kTokens: 0.0005,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large (Latest)',
    description: 'Latest large Mistral model',
    contextWindow: 32768,
    costPer1kTokens: 0.003,
    provider: 'mistral',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  // xAI Grok
  {
    id: 'grok-3',
    name: 'Grok-3',
    description: 'xAI Grok-3, latest flagship model.',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'grok',
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'grok-3-mini',
    name: 'Grok-3 Mini',
    description: 'xAI Grok-3 Mini, lightweight and fast.',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    provider: 'grok',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok-2 Vision',
    description: 'xAI Grok-2 Vision, multimodal model.',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'grok',
    capabilities: {
      chat: true,
      imageUnderstanding: true
    }
  },
  {
    id: 'grok-2-1212',
    name: 'Grok-2',
    description: 'xAI Grok-2, general-purpose model.',
    contextWindow: 128000,
    costPer1kTokens: 0.008,
    provider: 'grok',
    capabilities: {
      chat: true
    }
  },
  // Cohere
  {
    id: 'command-r-plus',
    name: 'Cohere Command R+',
    description: 'Cohere’s most advanced model for reasoning and chat.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'command-r',
    name: 'Cohere Command R',
    description: 'Cohere’s fast, general-purpose model.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    capabilities: {
      chat: true
    }
  },
  {
    id: 'command',
    name: 'Cohere Command',
    description: 'Cohere’s base model for general tasks.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.004,
    capabilities: {
      chat: true
    }
  },
  {
    id: 'command-nightly',
    name: 'Cohere Command Nightly',
    description: 'Cohere’s nightly build for latest features.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.003,
    capabilities: {
      chat: true
    }
  },
  {
    id: 'command-light',
    name: 'Cohere Command Light',
    description: 'Cohere’s lightweight model for fast inference.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.002,
    capabilities: {
      chat: true
    }
  },
  {
    id: 'command-light-nightly',
    name: 'Cohere Command Light Nightly',
    description: 'Cohere’s lightweight nightly build.',
    maxTokens: 4096,
    provider: 'cohere',
    contextWindow: 128000,
    costPer1kTokens: 0.001,
    capabilities: {
      chat: true
    }
  },
  // DeepSeek
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek’s chat-optimized model.',
    maxTokens: 4096,
    provider: 'deepseek',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    capabilities: {
      chat: true
    }
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'DeepSeek’s code generation model.',
    maxTokens: 4096,
    provider: 'deepseek',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    capabilities: {
      chat: true,
      codeCompletion: true
    }
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek’s advanced reasoning model.',
    maxTokens: 4096,
    provider: 'deepseek',
    contextWindow: 128000,
    costPer1kTokens: 0.012,
    capabilities: {
      chat: true
    }
  },
  // Perplexity
  {
    id: 'pplx-70b-chat',
    name: 'Perplexity 70B Chat',
    description: 'Perplexity’s 70B parameter chat model.',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'pplx-7b-chat',
    name: 'Perplexity 7B Chat',
    description: 'Perplexity’s 7B parameter chat model.',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'sonar',
    name: 'Perplexity Sonar',
    description: 'Perplexity Sonar, general-purpose model.',
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    description: 'Perplexity Sonar Pro, advanced model.',
    contextWindow: 128000,
    costPer1kTokens: 0.02,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'sonar-reasoning',
    name: 'Perplexity Sonar Reasoning',
    description: 'Perplexity Sonar Reasoning, optimized for reasoning tasks.',
    contextWindow: 128000,
    costPer1kTokens: 0.015,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'sonar-reasoning-pro',
    name: 'Perplexity Sonar Reasoning Pro',
    description: 'Perplexity Sonar Reasoning Pro, advanced reasoning model.',
    contextWindow: 128000,
    costPer1kTokens: 0.025,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  {
    id: 'sonar-deep-research',
    name: 'Perplexity Sonar Deep Research',
    description: 'Perplexity Sonar Deep Research, for deep research tasks.',
    contextWindow: 128000,
    costPer1kTokens: 0.03,
    provider: 'perplexity',
    capabilities: {
      chat: true
    }
  },
  // OpenRouter Main Models
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'OpenAI GPT-3.5 Turbo (OpenRouter)',
    description: 'OpenAI\'s fast, cost-effective chat model via OpenRouter',
    contextWindow: 16384,
    costPer1kTokens: 0.5,
    provider: 'openrouter',
    capabilities: { chat: true, codeCompletion: true }
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Anthropic Claude 3 Haiku (OpenRouter)',
    description: 'Anthropic\'s fast, affordable model via OpenRouter',
    contextWindow: 200000,
    costPer1kTokens: 0.25,
    provider: 'openrouter',
    capabilities: { chat: true }
  },
  {
    id: 'google/gemini-pro',
    name: 'Google Gemini Pro (OpenRouter)',
    description: 'Google\'s main chat model via OpenRouter',
    contextWindow: 32768,
    costPer1kTokens: 0.25,
    provider: 'openrouter',
    capabilities: { chat: true }
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large (OpenRouter)',
    description: 'Mistral\'s flagship model via OpenRouter',
    contextWindow: 32000,
    costPer1kTokens: 0.7,
    provider: 'openrouter',
    capabilities: { chat: true, codeCompletion: true }
  },
  {
    id: 'cohere/command-r',
    name: 'Cohere Command R (OpenRouter)',
    description: 'Cohere\'s main chat model via OpenRouter',
    contextWindow: 128000,
    costPer1kTokens: 0.2,
    provider: 'openrouter',
    capabilities: { chat: true }
  },
  {
    id: 'perplexity/sonar-medium-online',
    name: 'Perplexity Sonar Medium (OpenRouter)',
    description: 'Perplexity\'s main model via OpenRouter',
    contextWindow: 32768,
    costPer1kTokens: 0.2,
    provider: 'openrouter',
    capabilities: { chat: true }
  },
  // ElevenLabs (removed)
];
