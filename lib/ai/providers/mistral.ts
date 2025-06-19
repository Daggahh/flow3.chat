import { createMistral } from '@ai-sdk/mistral';
import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { CompletionOptions, Message, SupportedModel } from './types';

export class MistralProvider extends BaseProvider {
  private client: ReturnType<typeof createMistral>;
  private baseURL: string = 'https://api.mistral.ai/v1';

  constructor(apiKey: string) {
    super({
      type: 'mistral',
      apiKey,
      models: [
        {
          id: 'mistral-medium',
          name: 'Mistral Medium',
          description: 'Balanced performance and efficiency',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.002,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'mistral-small',
          name: 'Mistral Small',
          description: 'Fast and efficient model',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.0002,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'mixtral-8x7b',
          name: 'Mixtral 8x7B',
          description: 'Open source mixture of experts model',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.0004,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'open-mistral-7b',
          name: 'Open Mistral 7B',
          description: 'Open Mistral 7B model',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.0002,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'open-mixtral-8x22b',
          name: 'Open Mixtral 8x22B',
          description: 'Open Mixtral 8x22B model',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.0005,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'mistral-large-latest',
          name: 'Mistral Large (Latest)',
          description: 'Latest large Mistral model',
          maxTokens: 4096,
          provider: 'mistral',
          contextWindow: 32768,
          costPer1kTokens: 0.003,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        }
      ]
    });

    this.client = createMistral({
      apiKey,
      baseURL: this.baseURL
    });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported by Mistral provider`);
    }

    // Use the AI SDK's chat method for completions
    const mistralModel = this.client.chat(model);
    // ...existing code for formatting messages and streaming...
    // For now, fallback to fetch as before, but you can expand to use the SDK's full streaming API if needed
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: options?.maxTokens,
        temperature: options?.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Mistral API error');
    }

    return new AIStream(response);
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((acc, msg) => {
      return acc + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
