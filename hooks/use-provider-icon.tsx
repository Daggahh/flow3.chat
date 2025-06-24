import {
  LogoOpenAI,
  LogoAnthropic,
  LogoGoogle,
  RouteIcon,
  GlobeIcon,
  Mistral,
  Cohere,
  Grok,
  Deepseek,
  OpenRouter,
} from "@/components/icons";
import { SiGooglegemini, SiPerplexity } from "react-icons/si";
import { ReactNode } from "react";

const providerIconMap: Record<string, ReactNode> = {
  openai: <LogoOpenAI size={18} />,
  anthropic: <LogoAnthropic />,
  google: <SiGooglegemini size={18} />,
  mistral: <Mistral size={18} />,
  openrouter: <OpenRouter size={18} />,
  grok: <Grok size={18} />,
  cohere: <Cohere size={18} />,
  deepseek: <Deepseek size={18} />,
  perplexity: <SiPerplexity size={18} />,
};

export function useProviderIcon(provider: string) {
  return providerIconMap[provider] || <GlobeIcon size={18} />;
}
