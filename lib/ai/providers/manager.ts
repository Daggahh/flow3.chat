import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GoogleProvider } from './google';
import { MistralProvider } from './mistral';
import { OpenRouterProvider } from './openrouter';
import { GrokProvider } from './grok';
import { CohereProvider } from './cohere';
import { DeepSeekProvider } from './deepseek';
import { PerplexityProvider } from './perplexity';
// import { ElevenLabsProvider } from './elevenlabs';
import type { ProviderType, SupportedModel } from './types';

export class ProviderManager {
  private static instance: ProviderManager;
  private providers: Map<ProviderType, any> = new Map();
  private apiKeys: Map<ProviderType, string> = new Map();

  private constructor() {}

  static getInstance(): ProviderManager {
    if (!this.instance) {
      this.instance = new ProviderManager();
    }
    return this.instance;
  }

  async initializeProvider(type: ProviderType, apiKey: string): Promise<void> {
    let provider;
    
    switch (type) {
      case 'openai':
        provider = new OpenAIProvider(apiKey);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(apiKey);
        break;
      case 'google':
        provider = new GoogleProvider(apiKey);
        break;
      case 'mistral':
        provider = new MistralProvider(apiKey);
        break;
      case 'openrouter':
        provider = new OpenRouterProvider(apiKey);
        break;
      case 'grok':
        provider = new GrokProvider(apiKey);
        break;
      case 'cohere':
        provider = new CohereProvider(apiKey);
        break;
      case 'deepseek':
        provider = new DeepSeekProvider(apiKey);
        break;
      case 'perplexity':
        provider = new PerplexityProvider(apiKey);
        break;
      // case 'elevenlabs':
      //   provider = new ElevenLabsProvider(apiKey);
      //   break;
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }

    const isValid = await provider.validateApiKey();
    if (!isValid) {
      throw new Error(`Invalid API key for provider ${type}`);
    }

    this.providers.set(type, provider);
    this.apiKeys.set(type, apiKey);
  }

  getProvider(type: ProviderType) {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not initialized`);
    }
    return provider;
  }

  getProviderForModel(modelId: SupportedModel) {
    for (const [type, provider] of this.providers.entries()) {
      const modelConfig = provider.getModelConfig(modelId);
      if (modelConfig) {
        return provider;
      }
    }
    throw new Error(`No provider found for model ${modelId}`);
  }

  isProviderInitialized(type: ProviderType): boolean {
    return this.providers.has(type);
  }

  getInitializedProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }

  clearProvider(type: ProviderType): void {
    this.providers.delete(type);
    this.apiKeys.delete(type);
  }

  clearAll(): void {
    this.providers.clear();
    this.apiKeys.clear();
  }
}
