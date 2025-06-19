import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { CompletionOptions, Message, SupportedModel } from './types';

export class GoogleProvider extends BaseProvider {
  private client: ReturnType<typeof createGoogleGenerativeAI>;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1';

  constructor(apiKey: string) {
    super({
      type: 'google',
      apiKey,
      models: [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable Google model with advanced reasoning',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.0025,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-1.5-pro-latest',
          name: 'Gemini 1.5 Pro (Latest)',
          description: 'Latest Gemini 1.5 Pro model',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.0025,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-1.5-pro-001',
          name: 'Gemini 1.5 Pro 001',
          description: 'Gemini 1.5 Pro model version 001',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.0025,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-1.5-pro-002',
          name: 'Gemini 1.5 Pro 002',
          description: 'Gemini 1.5 Pro model version 002',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.0025,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-2.0-pro-exp-02-05',
          name: 'Gemini 2.0 Pro Experimental',
          description: 'Next-gen experimental model with enhanced capabilities',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.005,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-2.5-pro-preview-05-06',
          name: 'Gemini 2.5 Pro Preview',
          description: 'Latest preview of Gemini 2.5 Pro model',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gemini-2.5-pro-exp-03-25',
          name: 'Gemini 2.5 Pro Experimental (2024-03-25)',
          description: 'Gemini 2.5 Pro experimental model released 2024-03-25',
          maxTokens: 32768,
          provider: 'google',
          contextWindow: 1000000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        }
      ]
    });

    this.client = createGoogleGenerativeAI({
      apiKey
    });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported by Google provider`);
    }

    try {
      const response = await fetch(`${this.baseURL}/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          contents: this.formatMessages(messages),
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens,
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Google API error');
      }

      return new AIStream(response);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(`Google API error: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }

  private formatMessages(messages: Message[]): Array<{role: string, parts: Array<{text: string}>}> {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));
  }

  estimateTokens(messages: Message[]): number {
    // Google uses characters as a rough approximation, dividing by 4 to convert to tokens
    return Math.ceil(messages.reduce((acc, msg) => 
      acc + msg.content.length, 0) / 4);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'x-goog-api-key': this.config.apiKey,
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
