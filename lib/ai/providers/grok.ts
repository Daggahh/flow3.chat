import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { createXai } from '@ai-sdk/xai';
import {
  CompletionOptions,
  Message,
  SupportedModel,
  ProviderType,
  ModelConfig
} from './types';

export class GrokProvider extends BaseProvider {
  private client: ReturnType<typeof createXai>;

  constructor(apiKey: string) {
    super({
      type: 'grok',
      apiKey,
      models: [
        {
          id: 'grok-3',
          name: 'Grok-3',
          description: 'xAI Grok-3, latest flagship model.',
          maxTokens: 4096,
          provider: 'grok',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'grok-3-mini',
          name: 'Grok-3 Mini',
          description: 'xAI Grok-3 Mini, lightweight and fast.',
          maxTokens: 4096,
          provider: 'grok',
          contextWindow: 128000,
          costPer1kTokens: 0.005,
          capabilities: {
            chat: true
          }
        },
        {
          id: 'grok-2-vision-1212',
          name: 'Grok-2 Vision',
          description: 'xAI Grok-2 Vision, multimodal model.',
          maxTokens: 4096,
          provider: 'grok',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'grok-2-1212',
          name: 'Grok-2',
          description: 'xAI Grok-2, general-purpose model.',
          maxTokens: 4096,
          provider: 'grok',
          contextWindow: 128000,
          costPer1kTokens: 0.008,
          capabilities: {
            chat: true
          }
        }
      ]
    });
    this.client = createXai({ apiKey });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    // Map messages to xAI SDK format
    const prompt = messages.map(m => {
      if (m.role === 'system') {
        return { role: 'system' as const, content: m.content };
      } else if (m.role === 'user') {
        return { role: 'user' as const, content: [{ type: "text" as const, text: m.content }] };
      } else {
        return { role: 'assistant' as const, content: [{ type: "text" as const, text: m.content }] };
      }
    });
    return this.client.chat(model).doStream({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt
    }) as unknown as AIStream;
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.chat('grok-3').doGenerate({
        inputFormat: 'messages',
        mode: { type: 'regular' },
        prompt: [
          { role: 'user', content: [{ type: 'text', text: 'ping' }] }
        ]
      });
      return true;
    } catch {
      return false;
    }
  }
}
