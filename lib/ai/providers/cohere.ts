import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { createCohere } from '@ai-sdk/cohere';
import {
  CompletionOptions,
  Message,
  SupportedModel,
  ProviderType,
  ModelConfig
} from './types';

export class CohereProvider extends BaseProvider {
  private client: ReturnType<typeof createCohere>;

  constructor(apiKey: string) {
    super({
      type: 'cohere',
      apiKey,
      models: [
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
        }
      ]
    });
    this.client = createCohere({ apiKey });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const prompt = messages.map(m => {
      if (m.role === 'system') {
        return { role: 'system' as const, content: m.content };
      } else if (m.role === 'user') {
        return { role: 'user' as const, content: [{ type: 'text' as const, text: m.content }] };
      } else {
        return { role: 'assistant' as const, content: [{ type: 'text' as const, text: m.content }] };
      }
    });
    return this.client.languageModel(model).doStream({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt
    }) as unknown as AIStream;
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((sum, m) => sum + (m.content.length / 4), 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.languageModel('command-r').doGenerate({
        inputFormat: 'messages',
        mode: { type: 'regular' },
        prompt: [
          { role: 'user', content: [{ type: 'text' as const, text: 'ping' }] }
        ]
      });
      return true;
    } catch {
      return false;
    }
  }
}
