// AI Provider Configuration
// Change VITE_AI_PROVIDER in .env to switch ("openrouter" | "gemini" | "groq")

export const AI_PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    models: {
      "openai/gpt-6-luna": "GPT-6 Luna (OpenAI)",
      "google/gemini-2.0-flash-001": "Gemini 2.0 Flash (Fast & Smart)",
      "meta-llama/llama-3.3-70b-instruct": "Llama 3.3 70B (High Quality)",
      "deepseek/deepseek-chat": "DeepSeek V3 (Affordable & Capable)",
      "qwen/qwen-2.5-72b-instruct": "Qwen 2.5 72B (Great Multilingual)",
      "mistralai/mistral-small-24b-instruct-2501": "Mistral Small (Fast)",
      "meta-llama/llama-3.1-8b-instruct:free": "Llama 3.1 8B (Free Tier)",
    },
    defaultModel: "openai/gpt-6-luna",
    envKey: "VITE_OPENROUTER_API_KEY",
  },
  groq: {
    name: "Groq",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    models: {
      "llama-3.3-70b-versatile": "Llama 3.3 70B (Fast & Smart)",
      "llama-3.1-8b-instant": "Llama 3.1 8B (Very Fast)",
      "mixtral-8x7b-32768": "Mixtral 8x7B (Good Balance)",
    },
    defaultModel: "llama-3.3-70b-versatile",
    envKey: "VITE_GROQ_API_KEY",
  },
  gemini: {
    name: "Google Gemini",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    models: {
      "gemini-2.0-flash": "Gemini 2.0 Flash (Fast)",
      "gemini-1.5-pro": "Gemini 1.5 Pro (Smart)",
      "gemini-1.5-flash": "Gemini 1.5 Flash (Balanced)",
    },
    defaultModel: "gemini-2.0-flash",
    envKey: "VITE_GEMINI_API_KEY",
  },
};

// Auto-detect provider based on available API keys or explicit VITE_AI_PROVIDER setting
export const detectActiveProvider = () => {
  const explicit = import.meta.env.VITE_AI_PROVIDER;
  if (explicit && AI_PROVIDERS[explicit]) {
    return explicit;
  }
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (openRouterKey && !openRouterKey.includes("your_") && !openRouterKey.includes("_here")) {
    return "openrouter";
  }
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes("your_") && !geminiKey.includes("_here")) {
    return "gemini";
  }
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqKey && !groqKey.includes("your_") && !groqKey.includes("_here")) {
    return "groq";
  }
  return "openrouter";
};

export const ACTIVE_PROVIDER = detectActiveProvider();
export const ACTIVE_MODEL =
  import.meta.env.VITE_AI_MODEL || AI_PROVIDERS[ACTIVE_PROVIDER]?.defaultModel || "openai/gpt-6-luna";

// Get current provider config
export const getActiveProvider = () => AI_PROVIDERS[ACTIVE_PROVIDER] || AI_PROVIDERS.openrouter;
export const getActiveModel = () => ACTIVE_MODEL;
