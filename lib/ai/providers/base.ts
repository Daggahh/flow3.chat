import { encryptApiKey } from '@/lib/encryption';
import { AIStream } from '../streams';
import { 
  CompletionOptions,
  Message, 
  ModelConfig, 
  ProviderConfig,
  ProviderInterface,
  ProviderType,
  SupportedModel
} from './types';

export abstract class BaseProvider implements ProviderInterface {
  protected config: ProviderConfig;
  
  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract generateCompletion(
    messages: Message[],
    model: SupportedModel,
    options?: CompletionOptions
  ): Promise<AIStream>;

  generateImage?(
    prompt: string, 
    options?: {
      size?: '256x256' | '512x512' | '1024x1024';
      quality?: 'standard' | 'hd'; 
    }
  ): Promise<string>;

  abstract estimateTokens(messages: Message[]): number;
  
  abstract validateApiKey(): Promise<boolean>;

  protected getModelConfig(modelId: SupportedModel): ModelConfig | undefined {
    return this.config.models.find(model => model.id === modelId);
  }

  protected async encryptApiKey(apiKey: string): Promise<string> {
    return encryptApiKey(apiKey);
  }
}
