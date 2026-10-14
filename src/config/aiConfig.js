// AI Configuration - OpenRouter Only (openai/gpt-6-luna)

export const AI_PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    models: {
      "openai/gpt-6-luna": "GPT-6 Luna (OpenAI)",
    },
    defaultModel: "openai/gpt-6-luna",
    envKey: "VITE_OPENROUTER_API_KEY",
  },
};

export const ACTIVE_PROVIDER = "openrouter";
export const ACTIVE_MODEL = "openai/gpt-6-luna";

export const getActiveProvider = () => AI_PROVIDERS.openrouter;
export const getActiveModel = () => ACTIVE_MODEL;
