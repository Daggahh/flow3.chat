import {
  LogoOpenAI,
  LogoAnthropic,
  LogoGoogle,
  RouteIcon,
  GlobeIcon,
  Mistral,
  Cohere,
} from "@/components/icons";
import { SiPerplexity, SiDeepnote } from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import { ReactNode } from "react";

const providerIconMap: Record<string, ReactNode> = {
  openai: <LogoOpenAI size={18} />,
  anthropic: <LogoAnthropic />,
  google: <LogoGoogle size={18} />,
  mistral: <Mistral size={18} />,
  openrouter: <RouteIcon size={18} />,
  grok: <FaRobot size={18} />,
  cohere: <Cohere size={18} />,
  deepseek: <SiDeepnote size={18} />,
  perplexity: <SiPerplexity size={18} />,
};

export function useProviderIcon(provider: string) {
  return providerIconMap[provider] || <GlobeIcon size={18} />;
}
