import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { CompletionOptions, Message, SupportedModel, ProviderType } from './types';

// Main models for each provider via OpenRouter
const MAIN_OPENROUTER_MODELS = [
  {
    id: 'openai/gpt-3.5-turbo' as SupportedModel,
    name: 'OpenAI GPT-3.5 Turbo',
    description: 'OpenAI\'s fast, cost-effective chat model',
    maxTokens: 4096,
    provider: 'openrouter' as ProviderType,
    contextWindow: 16384,
    costPer1kTokens: 0.5,
    capabilities: { chat: true, codeCompletion: true }
  },
  {
    id: 'anthropic/claude-3-haiku' as SupportedModel,
    name: 'Anthropic Claude 3 Haiku',
    description: 'Anthropic\'s fast, affordable model',
    maxTokens: 4096,
    provider: 'openrouter' as ProviderType,
    contextWindow: 200000,
    costPer1kTokens: 0.25,
    capabilities: { chat: true }
  },
  {
    id: 'google/gemini-pro' as SupportedModel,
    name: 'Google Gemini Pro',
    description: 'Google\'s main chat model',
    maxTokens: 4096,
    provider: 'openrouter' as ProviderType,
    contextWindow: 32768,
    costPer1kTokens: 0.25,
    capabilities: { chat: true }
  },
  {
    id: 'mistralai/mistral-large' as SupportedModel,
    name: 'Mistral Large',
    description: 'Mistral\'s flagship model',
    maxTokens: 32000,
    provider: 'openrouter' as ProviderType,
    contextWindow: 32000,
    costPer1kTokens: 0.7,
    capabilities: { chat: true, codeCompletion: true }
  },
  {
    id: 'cohere/command-r' as SupportedModel,
    name: 'Cohere Command R',
    description: 'Cohere\'s main chat model',
    maxTokens: 4096,
    provider: 'openrouter' as ProviderType,
    contextWindow: 128000,
    costPer1kTokens: 0.2,
    capabilities: { chat: true }
  },
  {
    id: 'perplexity/sonar-medium-online' as SupportedModel,
    name: 'Perplexity Sonar Medium',
    description: 'Perplexity\'s main model',
    maxTokens: 4096,
    provider: 'openrouter' as ProviderType,
    contextWindow: 32768,
    costPer1kTokens: 0.2,
    capabilities: { chat: true }
  }
];

export class OpenRouterProvider extends BaseProvider {
  private client: ReturnType<typeof createOpenRouter>;

  constructor(apiKey: string) {
    super({
      type: 'openrouter',
      apiKey,
      models: MAIN_OPENROUTER_MODELS
    });
    this.client = createOpenRouter({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported by OpenRouter provider`);
    }
    // Use the ai-sdk OpenRouter provider
    const chatModel = this.client(model as string);
    const result = await chatModel.doStream({
      ...( { messages: messages.map(m => ({ role: m.role, content: m.content })) } as any ),
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      // Add other options as needed
    });
    // Transform the stream to extract textDelta
    const textStream = new ReadableStream<string>({
      async start(controller) {
        const reader = result.stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value && typeof value === 'object' && 'textDelta' in value) {
              controller.enqueue(value.textDelta);
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      }
    });
    return AIStream.fromReadableStream(textStream);
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((acc, msg) => {
      return acc + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Use the SDK to fetch models as validation
      const models = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
      });
      return models.ok;
    } catch (error) {
      return false;
    }
  }
}
