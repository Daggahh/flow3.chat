import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { createDeepSeek } from '@ai-sdk/deepseek';
import {
  CompletionOptions,
  Message,
  SupportedModel,
  ProviderType,
  ModelConfig
} from './types';

export class DeepSeekProvider extends BaseProvider {
  private client: ReturnType<typeof createDeepSeek>;

  constructor(apiKey: string) {
    super({
      type: 'deepseek',
      apiKey,
      models: [
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
        }
      ]
    });
    this.client = createDeepSeek({ apiKey });
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
      await this.client.languageModel('deepseek-chat').doGenerate({
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
