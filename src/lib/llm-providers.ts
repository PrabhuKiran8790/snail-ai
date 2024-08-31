import OpenAI from "openai";
import { GroqLogo, OllamaLogo, OpenAILogo } from "./components/icons";

interface Provider {
  name: string;
  value: string;
  logo: typeof OllamaLogo | typeof OpenAILogo;
}

export const defaultModelProviders = [
  {
    name: "Ollama",
    model_provider: "ollama",
    api_key: "ollama",
    api_url: "http://localhost:11434/v1",
    is_enabled: false,
    logo: OllamaLogo,
  },
  {
    name: "OpenAI",
    model_provider: "openai",
    api_key: "",
    api_url: "https://api.openai.com/v1",
    is_enabled: false,
    logo: OpenAILogo,
  },
  {
    name: "Groq",
    model_provider: "groq",
    api_key: "",
    api_url: "https://api.openai.com/v1",
    is_enabled: false,
    logo: GroqLogo,
  },
];

export interface ProviderConfig {
  name: {
    editable: boolean;
  };
  apiKey: {
    editable: boolean;
    placeholder: string;
  };
  url: {
    editable: boolean;
    placeholder: string;
  };
}

type models = "ollama" | "openai" | string;

export const providerConfigs: Record<models, ProviderConfig> = {
  openai: {
    name: { editable: false },
    apiKey: { editable: true, placeholder: "sk-..." },
    url: { editable: true, placeholder: "https://api.openai.com/v1" },
  },
  ollama: {
    name: { editable: false },
    apiKey: { editable: false, placeholder: "" },
    url: { editable: true, placeholder: "http://localhost:11434" },
  },
};

export const providers: Provider[] = [
  {
    name: "Ollama",
    value: "ollama",
    logo: OllamaLogo,
  },
  {
    name: "OpenAI",
    value: "openai",
    logo: OpenAILogo,
  },
  {
    name: "Groq",
    value: "groq",
    logo: GroqLogo,
  },
];

export const ollamaOpenAIClient = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
  dangerouslyAllowBrowser: true,
});

export const openaiClient = ({
  apiKey,
  baseURL,
}: {
  apiKey: string;
  baseURL: string;
}) => {
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};
