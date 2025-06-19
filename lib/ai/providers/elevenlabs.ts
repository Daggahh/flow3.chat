// import { BaseProvider } from './base';
// import { AIStream } from '../streams';
// import { createElevenLabs } from '@ai-sdk/elevenlabs';
// import {
//   CompletionOptions,
//   Message,
//   SupportedModel,
//   ProviderType,
//   ModelConfig
// } from './types';

// export class ElevenLabsProvider extends BaseProvider {
//   private client: ReturnType<typeof createElevenLabs>;

//   constructor(apiKey: string) {
//     super({
//       type: 'elevenlabs',
//       apiKey,
//       models: [
//         {
//           id: 'eleven-monolingual-v1',
//           name: 'ElevenLabs Monolingual v1',
//           description: 'ElevenLabs monolingual voice model.',
//           maxTokens: 4096,
//           provider: 'elevenlabs',
//           contextWindow: 128000,
//           costPer1kTokens: 0.02,
//           capabilities: {
//             chat: true
//           }
//         },
//         {
//           id: 'eleven-multilingual-v1',
//           name: 'ElevenLabs Multilingual v1',
//           description: 'ElevenLabs multilingual voice model.',
//           maxTokens: 4096,
//           provider: 'elevenlabs',
//           contextWindow: 128000,
//           costPer1kTokens: 0.025,
//           capabilities: {
//             chat: true
//           }
//         },
//         {
//           id: 'scribe_v1',
//           name: 'ElevenLabs Scribe v1',
//           description: 'ElevenLabs Scribe v1 transcription model.',
//           maxTokens: 4096,
//           provider: 'elevenlabs',
//           contextWindow: 128000,
//           costPer1kTokens: 0.03,
//           capabilities: {
//             chat: true
//           }
//         },
//         {
//           id: 'scribe_v1_experimental',
//           name: 'ElevenLabs Scribe v1 Experimental',
//           description: 'ElevenLabs Scribe v1 experimental transcription model.',
//           maxTokens: 4096,
//           provider: 'elevenlabs',
//           contextWindow: 128000,
//           costPer1kTokens: 0.03,
//           capabilities: {
//             chat: true
//           }
//         },
//       ]
//     });
//     this.client = createElevenLabs({ apiKey });
//   }

//   async generateCompletion(
//     messages: Message[],
//     model: SupportedModel,
//     options?: CompletionOptions
//   ): Promise<AIStream> {
//     // ElevenLabs is primarily for transcription, so we use transcription().doGenerate()
//     const prompt = messages.map(m => m.content).join('\n');
//     // This will return a Promise, not a stream, so wrap in AIStream.fromData
//     const result = await this.client.transcription(model).doGenerate({ prompt });
//     return AIStream.fromData(result);
//   }

//   estimateTokens(messages: Message[]): number {
//     return messages.reduce((sum, m) => sum + (m.content.length / 4), 0);
//   }

//   async validateApiKey(): Promise<boolean> {
//     try {
//       await this.client.transcription('scribe_v1').doGenerate({ prompt: 'ping' });
//       return true;
//     } catch {
//       return false;
//     }
//   }
// }
