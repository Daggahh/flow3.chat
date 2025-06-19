import { type AnthropicProvider as AnthropicSDKProvider, createAnthropic } from '@ai-sdk/anthropic';
import { AIStream } from '../streams';
import { type Message, type SupportedModel, type CompletionOptions } from './types';
import { BaseProvider } from './base';

export class AnthropicProvider extends BaseProvider {
  private client: AnthropicSDKProvider;

  constructor(apiKey: string) {
    super({
      type: 'anthropic',
      apiKey,
      models: [
        {
          id: 'claude-4-opus-20250514',
          name: 'Claude 4 Opus',
          description: 'Most capable Claude model with highest token limit',
          maxTokens: 200000,
          provider: 'anthropic',
          contextWindow: 200000,
          costPer1kTokens: 0.015,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'claude-4-sonnet-20250514',
          name: 'Claude 4 Sonnet',
          description: 'Balanced Claude model optimized for efficiency',
          maxTokens: 200000,
          provider: 'anthropic',
          contextWindow: 200000,
          costPer1kTokens: 0.008,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'claude-3-7-sonnet-20250219',
          name: 'Claude 3.7 Sonnet',
          description: 'Latest Claude 3.7 model with reasoning capabilities',
          maxTokens: 32768,
          provider: 'anthropic', 
          contextWindow: 32768,
          costPer1kTokens: 0.004,
          capabilities: {
            chat: true,
            codeCompletion: true,
          }
        },
        {
          id: 'claude-3-5-sonnet-latest',
          name: 'Claude 3.5 Sonnet Latest',
          description: 'Latest Claude 3.5 Sonnet model',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.003,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet (2024-10)',
          description: 'Claude 3.5 Sonnet October 2024 release',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.003,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'claude-3-5-sonnet-20240620',
          name: 'Claude 3.5 Sonnet (2024-06)',
          description: 'Claude 3.5 Sonnet June 2024 release',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.003,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'claude-3-5-haiku-latest',
          name: 'Claude 3.5 Haiku Latest',
          description: 'Latest Claude 3.5 Haiku model optimized for speed',
          maxTokens: 16384,
          provider: 'anthropic',
          contextWindow: 16384,
          costPer1kTokens: 0.002,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku (2024-10)',
          description: 'Claude 3.5 Haiku October 2024 release',
          maxTokens: 16384,
          provider: 'anthropic',
          contextWindow: 16384,
          costPer1kTokens: 0.002,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'claude-3-opus-latest',
          name: 'Claude 3 Opus Latest',
          description: 'Latest Claude 3 Opus model',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.008,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus (2024-02)',
          description: 'Claude 3 Opus February 2024 release',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.008,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet (2024-02)',
          description: 'Claude 3 Sonnet February 2024 release',
          maxTokens: 32768,
          provider: 'anthropic',
          contextWindow: 32768,
          costPer1kTokens: 0.003,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku (2024-03)',
          description: 'Claude 3 Haiku March 2024 release',
          maxTokens: 16384,
          provider: 'anthropic',
          contextWindow: 16384,
          costPer1kTokens: 0.002,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        }
      ]
    });

    this.client = createAnthropic({
      apiKey,
      baseURL: 'https://api.anthropic.com/v1',
    });
  }

  private formatMessages(messages: Message[]) {
    return messages.map(msg => {
      // Map assistant/user roles to Anthropic's expected format
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      return {
        role,
        content: msg.content
      };
    });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported by Anthropic provider`);
    }

    try {
      // Format messages for Anthropic's API
      const formattedMessages = this.formatMessages(messages);

      // Make the API call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: true,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens,
          top_p: options?.topP ?? 1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${JSON.stringify(error)}`);
      }

      return new AIStream(response);
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  estimateTokens(messages: Message[]): number {
    // Use Claude's token counting approach
    return messages.reduce((acc, msg) => {
      // Rough estimate: 1 token ≈ 4 characters
      return acc + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test the API key with a minimal request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-latest',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });

      return response.ok;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
}
