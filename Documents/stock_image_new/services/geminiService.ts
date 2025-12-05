
import { GoogleGenAI, Type } from "@google/genai";
import type { StockMetadata } from '../types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors (e.g., validation errors, API key errors)
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key') || 
            errorMessage.includes('invalid') ||
            errorMessage.includes('parse') ||
            errorMessage.includes('structure')) {
          throw error; // Don't retry validation/configuration errors
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateStockMetadata = async (imageFile: File, titleCount: number = 5): Promise<StockMetadata> => {
    
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in your .env.local file.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const imagePart = await fileToGenerativePart(imageFile);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: `An array of exactly ${titleCount} unique, descriptive, and SEO-optimized titles for the image.`,
            items: { type: Type.STRING }
        },
        keywords: {
            type: Type.ARRAY,
            description: "An array of exactly 48 relevant, non-categorized keywords for the image. All keywords must be in lowercase.",
            items: { type: Type.STRING }
        }
    },
    required: ["titles", "keywords"]
  };

  const prompt = `You are an expert in SEO for stock photography platforms like Adobe Stock. Analyze the provided image and generate metadata to maximize its discoverability. 
  
  Instructions:
  1.  Provide exactly ${titleCount} unique, descriptive, and SEO-optimized titles.
  2.  Provide exactly 48 relevant keywords.
  3.  The keywords must be a flat list, not categorized.
  4.  The keywords should cover concepts, subjects, actions, lighting, composition, and emotions depicted in the image.
  5.  All keywords MUST be in simple lowercase letters (no uppercase).
  
  Format your response as a JSON object that adheres to the provided schema.`;

  // Wrap API call with retry logic
  const response = await retryWithBackoff(async () => {
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
      config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
      }
    });
  });

  try {
    const text = response.text.trim();
    const parsedJson = JSON.parse(text) as { titles?: unknown; keywords?: unknown };
    
    // Validate structure
    if (!parsedJson.titles || !parsedJson.keywords || !Array.isArray(parsedJson.titles) || !Array.isArray(parsedJson.keywords)) {
        throw new Error("Invalid JSON structure received from API.");
    }

    // Validate exact counts
    if (parsedJson.titles.length !== titleCount) {
        console.warn(`Expected ${titleCount} titles, but received ${parsedJson.titles.length}. Adjusting...`);
        // Trim or pad to match expected count
        if (parsedJson.titles.length > titleCount) {
            parsedJson.titles = parsedJson.titles.slice(0, titleCount);
        } else {
            // Pad with generic titles if needed (shouldn't happen, but handle gracefully)
            while (parsedJson.titles.length < titleCount) {
                parsedJson.titles.push(`Title ${parsedJson.titles.length + 1}`);
            }
        }
    }

    if (parsedJson.keywords.length !== 48) {
        console.warn(`Expected 48 keywords, but received ${parsedJson.keywords.length}. Adjusting...`);
        // Trim or pad to match expected count
        if (parsedJson.keywords.length > 48) {
            parsedJson.keywords = parsedJson.keywords.slice(0, 48);
        } else {
            // Pad with generic keywords if needed (shouldn't happen, but handle gracefully)
            while (parsedJson.keywords.length < 48) {
                parsedJson.keywords.push(`keyword${parsedJson.keywords.length + 1}`);
            }
        }
    }

    // FORCE all keywords to lowercase and ensure they're strings
    const normalizedKeywords = parsedJson.keywords.map((k: unknown) => String(k).toLowerCase().trim()).filter((k: string) => k.length > 0);

    // Ensure we have exactly 48 keywords after normalization
    if (normalizedKeywords.length !== 48) {
        throw new Error(`After normalization, expected 48 keywords but got ${normalizedKeywords.length}.`);
    }

    return {
        titles: parsedJson.titles.map((t: unknown) => String(t).trim()).filter((t: string) => t.length > 0),
        keywords: normalizedKeywords
    } as StockMetadata;
  } catch(e) {
    console.error("Failed to parse Gemini response:", response.text);
    if (e instanceof Error) {
        throw new Error(`Could not parse the response from the AI model: ${e.message}`);
    }
    throw new Error("Could not parse the response from the AI model. Please try again.");
  }
};
