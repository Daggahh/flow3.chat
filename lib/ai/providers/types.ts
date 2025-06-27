export type SupportedModel = 
  // OpenAI Models
  | 'gpt-4-turbo-preview'  
  | 'gpt-4-turbo'
  | 'gpt-4.5-preview'
  | 'gpt-4o'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  // Anthropic Models
  | 'claude-4-opus-20250514'
  | 'claude-4-sonnet-20250514'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-haiku-latest'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-latest'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  // Google Models
  | 'gemini-1.5-pro'
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-pro-001'
  | 'gemini-1.5-pro-002'
  | 'gemini-2.0-pro-exp-02-05'
  | 'gemini-1.5-flash'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro-preview-05-06'
  | 'gemini-2.5-pro-exp-03-25' 
  // Mistral Models
  | 'mistral-medium'
  | 'mistral-small'
  | 'mixtral-8x7b'
  | 'open-mistral-7b'
  | 'open-mixtral-8x22b'
  | 'mistral-large-latest'
  // xAI Grok
  | 'grok-3'
  | 'grok-3-mini'
  | 'grok-2-vision-1212'
  | 'grok-2-1212'
  // Cohere Models
  | 'command-r-plus'
  | 'command-r'
  | 'command'
  | 'command-nightly'
  | 'command-light'
  | 'command-light-nightly'
  // DeepSeek Models
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  // Perplexity Models
  | 'pplx-70b-chat'
  | 'pplx-7b-chat'
  | 'sonar'
  | 'sonar-pro'
  | 'sonar-reasoning'
  | 'sonar-reasoning-pro'
  | 'sonar-deep-research'
  // OpenRouter Main Models
  | 'openai/gpt-3.5-turbo'
  | 'anthropic/claude-3-haiku'
  | 'google/gemini-pro'
  | 'mistralai/mistral-large'
  | 'cohere/command-r'
  | 'perplexity/sonar-medium-online';

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'openrouter'
  | 'grok'
  | 'cohere'
  | 'deepseek'
  | 'perplexity';

export interface ModelConfig {
  id: SupportedModel;
  name: string;
  description: string;
  maxTokens: number;
  provider: ProviderType;
  contextWindow: number;
  costPer1kTokens: number;
  capabilities: {
    chat: boolean;
    imageGeneration?: boolean;
    imageUnderstanding?: boolean;
    codeCompletion?: boolean;
  };
}
