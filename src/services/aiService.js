import {
  AI_PROVIDERS,
  ACTIVE_PROVIDER,
  ACTIVE_MODEL,
  getActiveProvider,
} from "../config/aiConfig";

// Standard Parolla alphabets in strict alphabetical order
// Turkish: 28 letters (Ğ is excluded because no Turkish word starts with Ğ)
export const TR_ALPHABET = [
  "A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L",
  "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z"
];

// English: 26 letters
export const EN_ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

export const getAlphabetForLanguage = (lang = "tr") => {
  return lang === "tr" ? TR_ALPHABET : EN_ALPHABET;
};

// Select ordered letters according to requested question count
export const selectLetters = (questionCount, lang = "tr") => {
  const alphabet = getAlphabetForLanguage(lang);
  if (questionCount === "all" || questionCount >= alphabet.length) {
    return alphabet;
  }
  const count = parseInt(questionCount, 10) || 10;
  return alphabet.slice(0, Math.min(count, alphabet.length));
};

const ERROR_MESSAGES = {
  tr: {
    apiKeyMissing:
      "OpenRouter API anahtarı bulunamadı. Lütfen .env dosyasındaki VITE_OPENROUTER_API_KEY değerini kontrol edin.",
    invalidFormat: "Yapay zeka yanıtı beklenen formatta değil. Lütfen tekrar deneyin.",
    networkError: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.",
    apiError: "Yapay zeka servisi şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.",
  },
  en: {
    apiKeyMissing:
      "OpenRouter API key not found. Please check VITE_OPENROUTER_API_KEY in your .env file.",
    invalidFormat: "AI response is not in the expected format. Please try again.",
    networkError: "Could not connect to server. Check your internet connection.",
    apiError: "AI service is currently unavailable. Please try again later.",
  },
};

const createPromptForLetters = (topic, lang, letters) => {
  const isTr = lang === "tr";
  const langName = isTr ? "Turkish" : "English";
  const lettersListStr = letters.join(", ");

  return `
You are an expert quizmaster writing official questions for the game "Parolla" (Passaparola).

TOPIC: "${topic}"
LANGUAGE: ${langName}
TARGET LETTERS (IN EXACT ALPHABETICAL ORDER):
[${lettersListStr}]

STRICT RULES:
1. ALPHABETICAL ORDER: You must generate EXACTLY one question for EACH letter listed above, maintaining the EXACT order [${lettersListStr}]. Total items: ${letters.length}.
2. ANSWER MUST START WITH LETTER: The answer MUST begin with that specific letter.
${isTr ? '   * In Turkish: Note the strict distinction between I and İ, C and Ç, O and Ö, U and Ü, S and Ş. Answers must strictly match their letter.' : ''}
3. NO NUMBERS OR SYMBOLS: Answers must NEVER begin with a number (e.g. 1923, 100), roman numeral, symbol, or quote. Answers MUST start with a valid alphabetical letter.
4. ANSWER LENGTH: Answers should be concise single words or well-known short terms (1-3 words max).
5. ACCEPTABLE ALIASES: Provide an "aliases" array for each question with common acceptable variants, alternate spellings (e.g. with/without accents), abbreviations, or common synonyms that players might legitimately type.
6. QUESTION QUALITY: Each question must be clear, engaging, factually accurate, unambiguous, and directly related to "${topic}".
7. REAL FACTS ONLY: Answers must be real names, places, concepts, or terms. Do not invent words.

OUTPUT FORMAT:
Return ONLY a valid JSON array of ${letters.length} objects. No markdown formatting, no backticks, no explanations.
Format:
[
  {
    "letter": "LETTER",
    "question": "Question text here?",
    "answer": "Primary Answer",
    "aliases": ["Alias 1", "Alias 2"]
  }
]
`;
};

// Clean answer from quotes, markdown, and unwanted symbols
const sanitizeText = (text) => {
  if (!text) return "";
  let cleaned = String(text).trim();
  cleaned = cleaned.replace(/^["'«»“”„]+|["'«»“”„]+$/g, "").trim();
  return cleaned;
};

const parseAIResponse = (responseText) => {
  let jsonStr = responseText.trim();

  // Remove markdown code fences if present
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }

  jsonStr = jsonStr.trim();

  // Extract bracketed JSON array if extra conversational text exists
  const startIndex = jsonStr.indexOf("[");
  const endIndex = jsonStr.lastIndexOf("]");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    jsonStr = jsonStr.slice(startIndex, endIndex + 1);
  }

  return JSON.parse(jsonStr);
};

const validateAndSanitizeData = (data, expectedLetters) => {
  if (!Array.isArray(data)) {
    throw new Error("Response is not an array");
  }

  const sanitized = [];

  for (let i = 0; i < expectedLetters.length; i++) {
    const expectedLetter = expectedLetters[i];
    const item = data[i];

    if (!item || !item.question || !item.answer) {
      throw new Error(`Missing question or answer at index ${i}`);
    }

    const cleanQuestion = sanitizeText(item.question);
    const cleanAnswer = sanitizeText(item.answer);
    const cleanAliases = Array.isArray(item.aliases)
      ? item.aliases.map((a) => sanitizeText(a)).filter(Boolean)
      : [];

    sanitized.push({
      letter: expectedLetter,
      question: cleanQuestion,
      answer: cleanAnswer,
      aliases: cleanAliases,
    });
  }

  return sanitized;
};

// ==========================================
// OPENROUTER API CALL (ONLY openai/gpt-6-luna)
// ==========================================

const callOpenRouterAPI = async (prompt, apiKey) => {
  const response = await fetch(AI_PROVIDERS.openrouter.apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
      "X-Title": "Parolla AI Quiz Game",
    },
    body: JSON.stringify({
      model: ACTIVE_MODEL, // strictly "openai/gpt-6-luna"
      messages: [
        {
          role: "system",
          content:
            "You are a precise JSON trivia generator for the quiz game Parolla. You ONLY return a valid JSON array matching the exact requested schema, with no markdown fences and no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
      provider: {
        allow_fallbacks: false, // Prevents OpenRouter from silently switching or routing to other models!
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("OpenRouter API Error:", errorData);
    throw new Error("API_ERROR");
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content;
};

// Helper to execute a single prompt for a chunk of letters
const fetchLettersBatch = async (topic, lang, letters, apiKey, errorMsgs) => {
  const prompt = createPromptForLetters(topic, lang, letters);
  const rawResponse = await callOpenRouterAPI(prompt, apiKey);

  if (!rawResponse) {
    throw new Error(errorMsgs.apiError);
  }

  let parsed;
  try {
    parsed = parseAIResponse(rawResponse);
  } catch (err) {
    console.error("Parse Error for batch:", err, rawResponse);
    throw new Error(errorMsgs.invalidFormat);
  }

  return validateAndSanitizeData(parsed, letters);
};

// ==========================================
// MAIN FUNCTION WITH SMART CHUNKING
// ==========================================

export const generateQuestions = async (
  topic,
  lang = "tr",
  questionCount = 10
) => {
  const apiKey = import.meta.env[AI_PROVIDERS.openrouter.envKey];
  const errorMsgs = ERROR_MESSAGES[lang] || ERROR_MESSAGES.en;

  // Check for API key
  if (!apiKey || apiKey.includes("your_") || apiKey.includes("_here")) {
    throw new Error(errorMsgs.apiKeyMissing);
  }

  // 1. Determine exactly which letters in alphabetical order
  const targetLetters = selectLetters(questionCount, lang);
  console.log(`=== Generating questions using ${ACTIVE_MODEL} for ${targetLetters.length} letters: ${targetLetters.join(', ')} ===`);

  try {
    let allQuestions = [];

    // If there are more than 14 letters (e.g. 20 or full alphabet 26-28),
    // split into two parallel requests
    if (targetLetters.length > 14) {
      const mid = Math.ceil(targetLetters.length / 2);
      const batch1 = targetLetters.slice(0, mid);
      const batch2 = targetLetters.slice(mid);

      const [res1, res2] = await Promise.all([
        fetchLettersBatch(topic, lang, batch1, apiKey, errorMsgs),
        fetchLettersBatch(topic, lang, batch2, apiKey, errorMsgs),
      ]);

      allQuestions = [...res1, ...res2];
    } else {
      allQuestions = await fetchLettersBatch(
        topic,
        lang,
        targetLetters,
        apiKey,
        errorMsgs
      );
    }

    return allQuestions;
  } catch (error) {
    console.error("Error in generateQuestions:", error);

    if (
      error.message.includes(errorMsgs.apiKeyMissing) ||
      error.message.includes(errorMsgs.invalidFormat) ||
      error.message.includes(errorMsgs.apiError)
    ) {
      throw error;
    }

    if (error.message === "API_ERROR") {
      throw new Error(errorMsgs.apiError);
    }

    throw new Error(errorMsgs.networkError);
  }
};

export { ACTIVE_PROVIDER, ACTIVE_MODEL, AI_PROVIDERS };
