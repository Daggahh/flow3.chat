import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { createPerplexity } from '@ai-sdk/perplexity';
import {
  CompletionOptions,
  Message,
  SupportedModel,
  ProviderType,
  ModelConfig
} from './types';

export class PerplexityProvider extends BaseProvider {
  private client: ReturnType<typeof createPerplexity>;

  constructor(apiKey: string) {
    super({
      type: 'perplexity',
      apiKey,
      models: [
        {
          id: 'pplx-70b-chat',
          name: 'Perplexity 70B Chat',
          description: 'Perplexity’s 70B parameter chat model.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: { chat: true }
        },
        {
          id: 'pplx-7b-chat',
          name: 'Perplexity 7B Chat',
          description: 'Perplexity’s 7B parameter chat model.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.005,
          capabilities: { chat: true }
        },
        {
          id: 'sonar',
          name: 'Perplexity Sonar',
          description: 'Perplexity Sonar, general-purpose model.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: { chat: true }
        },
        {
          id: 'sonar-pro',
          name: 'Perplexity Sonar Pro',
          description: 'Perplexity Sonar Pro, advanced model.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.02,
          capabilities: { chat: true }
        },
        {
          id: 'sonar-reasoning',
          name: 'Perplexity Sonar Reasoning',
          description: 'Perplexity Sonar Reasoning, optimized for reasoning tasks.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.015,
          capabilities: { chat: true }
        },
        {
          id: 'sonar-reasoning-pro',
          name: 'Perplexity Sonar Reasoning Pro',
          description: 'Perplexity Sonar Reasoning Pro, advanced reasoning model.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.025,
          capabilities: { chat: true }
        },
        {
          id: 'sonar-deep-research',
          name: 'Perplexity Sonar Deep Research',
          description: 'Perplexity Sonar Deep Research, for deep research tasks.',
          maxTokens: 4096,
          provider: 'perplexity',
          contextWindow: 128000,
          costPer1kTokens: 0.03,
          capabilities: { chat: true }
        }
      ]
    });
    this.client = createPerplexity({ apiKey });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    _options?: CompletionOptions
  ): Promise<AIStream> {
    // Only include user and assistant messages, and map content to correct format
    const mappedMessages = messages
      .filter((m): m is { role: 'user' | 'assistant'; content: string } => m.role === 'user' || m.role === 'assistant')
      .map(m =>
        m.role === 'user'
          ? ({ role: 'user', content: [{ type: 'text', text: m.content }] } as { role: 'user'; content: { type: 'text'; text: string }[] })
          : ({ role: 'assistant', content: [{ type: 'text', text: m.content }] } as { role: 'assistant'; content: { type: 'text'; text: string }[] })
      )
      .map(x => ({ ...x, content: [...x.content] })); // ensure mutable array
    const { stream } = await this.client(model).doStream({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: mappedMessages
    });
    return stream as unknown as AIStream;
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((sum, m) => sum + (m.content.length / 4), 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const { stream } = await this.client('sonar').doStream({
        inputFormat: 'messages',
        mode: { type: 'regular' },
        prompt: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }]
      });
      const reader = stream.getReader();
      await reader.read();
      reader.releaseLock();
      return true;
    } catch {
      return false;
    }
  }
}
