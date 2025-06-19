import {  createOpenAI } from '@ai-sdk/openai';
import { BaseProvider } from './base';
import { AIStream } from '../streams';
import { 
  CompletionOptions,
  Message,
  SupportedModel 
} from './types';

export class OpenAIProvider extends BaseProvider {
  private client: ReturnType<typeof createOpenAI>;

  constructor(apiKey: string) {
    super({
      type: 'openai',
      apiKey,
      models: [
        {
          id: 'gpt-4-turbo-preview',
          name: 'GPT-4 Turbo',
          description: 'Most capable GPT-4 model, great for tasks requiring advanced reasoning',
          maxTokens: 4096,
          provider: 'openai',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'OpenAI GPT-4 Turbo',
          maxTokens: 4096,
          provider: 'openai',
          contextWindow: 128000,
          costPer1kTokens: 0.01,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gpt-4.5-preview',
          name: 'GPT-4.5 Preview',
          description: 'OpenAI GPT-4.5 Preview',
          maxTokens: 4096,
          provider: 'openai',
          contextWindow: 128000,
          costPer1kTokens: 0.02,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: 'OpenAI GPT-4o, multimodal and fast',
          maxTokens: 4096,
          provider: 'openai',
          contextWindow: 128000,
          costPer1kTokens: 0.005,
          capabilities: {
            chat: true,
            codeCompletion: true,
            imageUnderstanding: true
          }
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Stable GPT-4 model with strong reasoning capabilities',
          maxTokens: 8192,
          provider: 'openai',
          contextWindow: 8192,
          costPer1kTokens: 0.03,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and cost-effective for most tasks',
          maxTokens: 4096,
          provider: 'openai',
          contextWindow: 16385,
          costPer1kTokens: 0.0015,
          capabilities: {
            chat: true,
            codeCompletion: true
          }
        }
      ]
    });

    this.client = createOpenAI({
      apiKey,
      baseURL: 'https://api.openai.com/v1'
    });
  }

  async generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream> {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported by OpenAI provider`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    return new AIStream(response);
  }

  async generateImage(
    prompt: string,
    options?: { 
      size?: '256x256' | '512x512' | '1024x1024';
    }
  ): Promise<string> {
    // Use the OpenAI SDK's image method
    const imageModel = this.client.image('dall-e-3');
    const result = await imageModel.doGenerate({
      prompt,
      n: 1,
      size: options?.size || '1024x1024',
      // aspectRatio, seed, providerOptions are optional and omitted
    } as any);
    const img = Array.isArray(result.images) ? result.images[0] : '';
    if (typeof img === 'string') return img;
    // If it's a buffer, convert to base64 data URL
    if (img instanceof Uint8Array) {
      return `data:image/png;base64,${Buffer.from(img).toString('base64')}`;
    }
    return '';
  }

  estimateTokens(messages: Message[]): number {
    return messages.reduce((acc, msg) => {
      return acc + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Use the OpenAI SDK's model listing endpoint
      const response = await fetch('https://api.openai.com/v1/models', {
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
