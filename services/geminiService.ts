import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, TransformationPlan, ProgressEntry, Exercise } from "../types";

/**
 * Ensures user has selected an API key before proceeding.
 */
const ensureApiKey = async () => {
  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio.openSelectKey();
    // Guideline: proceed assuming selection was successful
  }
};

/**
 * Robust exponential backoff utility with jitter for handling rate limits (429) and transient errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || "";
      
      const isRateLimit = errorMsg.includes('429') || 
                          errorMsg.includes('quota') || 
                          errorMsg.includes('resource_exhausted') ||
                          errorMsg.includes('limit');
                          
      const isTransient = isRateLimit || 
                          errorMsg.includes('500') || 
                          errorMsg.includes('xhr error') || 
                          errorMsg.includes('fetch') ||
                          errorMsg.includes('unknown');
      
      if (!isTransient || i === maxRetries - 1) break;
      
      const baseDelay = isRateLimit ? initialDelay * 2.5 : initialDelay;
      const delay = (baseDelay * Math.pow(2, i)) + (Math.random() * 1000);
      
      console.warn(`API attempt ${i + 1} failed (${isRateLimit ? 'Rate Limit' : 'Transient'}). Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

/**
 * GUIDELINE: Always create a new GoogleGenAI instance right before making an API call 
 * to ensure it always uses the most up-to-date API key from the dialog.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) lines.shift();
    if (lines[lines.length - 1].startsWith("```")) lines.pop();
    cleaned = lines.join("\n").trim();
  }
  
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;

  if (start !== -1 && end !== -1 && end >= start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned;
};

// Removed generateFoodImage as it's no longer used due to image removal from PlanDisplay

const exerciseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    sets: { type: Type.STRING },
    reps: { type: Type.STRING },
    rest: { type: Type.STRING },
    tips: { type: Type.STRING }
  },
  required: ["name", "sets", "reps", "rest", "tips"]
};

const dietPlanDaySchema = { // Schema for a single day's diet plan
  type: Type.OBJECT,
  properties: {
    breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.NUMBER } }, required: ["name", "description", "calories"] },
    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.NUMBER } }, required: ["name", "description", "calories"] },
    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, calories: { type: Type.NUMBER } }, required: ["name", "description", "calories"] },
    snacks: { 
      type: Type.ARRAY, 
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the snack, e.g., "Apple" or "Handful of almonds".' },
          description: { type: Type.STRING, description: 'Brief description or nutritional context for the snack.' },
        },
        required: ["name", "description"]
      },
      description: 'A list of recommended snack items with names and descriptions.'
    },
    supplements: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["breakfast", "lunch", "dinner", "snacks", "supplements"]
};

const workoutDaySchema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    focus: { type: Type.STRING },
    warmUpExercises: { // New: Warm-up exercises
      type: Type.ARRAY,
      items: exerciseSchema,
      description: 'A list of 3-5 warm-up exercises targeting the primary muscle groups for the day, with sets, reps, rest, and tips.'
    },
    exercises: {
      type: Type.ARRAY,
      items: exerciseSchema
    },
    rehabExercises: { // Added rehabExercises to the schema
      type: Type.ARRAY,
      items: exerciseSchema,
      description: 'Optional list of mild rehabilitation exercises for specific medical conditions.'
    },
    coolDownExercises: { // New: Cool-down exercises
      type: Type.ARRAY,
      items: exerciseSchema,
      description: 'A list of 3-5 cool-down stretches or mobility exercises for the worked muscle groups, with sets, reps, rest, and tips.'
    }
  },
  required: ["day", "focus", "warmUpExercises", "exercises", "coolDownExercises"]
};

const planSchema = {
  type: Type.OBJECT,
  properties: {
    estimatedWeeks: { type: Type.INTEGER },
    timeframe: { type: Type.STRING },
    dailyCalories: { type: Type.NUMBER },
    macros: {
      type: Type.OBJECT,
      properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fats: { type: Type.NUMBER } },
      required: ["protein", "carbs", "fats"]
    },
    dailyDietPlans: { // Updated to an array of daily diet plans
      type: Type.ARRAY,
      items: dietPlanDaySchema,
      minItems: 7,
      maxItems: 7,
      description: 'An array of 7 distinct diet plans, one for each day of the week.'
    },
    workoutPlan: {
      type: Type.ARRAY,
      items: workoutDaySchema // Using the new workoutDaySchema
    },
    summary: { type: Type.STRING },
    progressStatus: { type: Type.STRING }
  },
  required: ["estimatedWeeks", "timeframe", "dailyCalories", "macros", "dailyDietPlans", "workoutPlan", "summary", "progressStatus"]
};

export const generateTransformationPlan = async (
  profile: UserProfile, 
  weekNumber: number = 1,
  history: ProgressEntry[] = []
): Promise<TransformationPlan> => {
  await ensureApiKey();
  return withRetry(async () => {
    const ai = getAI();

    const allCuisinePreferences = [
      ...(profile.cuisine || []),
      ...(profile.customCuisinePreferences || [])
    ].filter(Boolean);

    const cuisineString = allCuisinePreferences.length > 0 
      ? `Dietary Preferences: ${allCuisinePreferences.join(', ')}.` 
      : '';

    const medicalConditionsPrompt = profile.medicalConditions && profile.medicalConditions.length > 0
      ? `User has reported medical conditions: ${profile.medicalConditions.join(', ')}. CRITICAL: AVOID any exercises that put direct stress or impact on these areas (e.g., for "Knee Pain", avoid heavy squats or lunges). Prioritize alternatives or omit if no safe options exist. Instead, suggest 1-2 mild rehabilitation exercises specifically for these conditions, listed in the 'rehabExercises' field for the relevant workout days. For example, for "Knee Pain", suggest gentle quad sets or straight leg raises.`
      : '';

    let weeklyProgressionPrompt = '';
    if (weekNumber > 1) {
      weeklyProgressionPrompt = `This is for Week ${weekNumber}. Crucially, introduce new exercise variations and logical progressions in intensity, volume, or technique compared to previous weeks to keep the user engaged and challenged. Reference past week's progress if available: ${JSON.stringify(history.slice(-3))}.`; // Include last 3 entries of history
    } else {
      weeklyProgressionPrompt = `This is for Week 1. Establish foundational exercises and a clear starting point.`;
    }

    const workoutPreferencesString = profile.workoutPreferences && profile.workoutPreferences.length > 0
      ? `User's preferred workout styles: ${profile.workoutPreferences.join(', ')}. CRITICAL: ONLY include exercises that strictly match these preferred workout styles. DO NOT include exercises from styles not listed in these preferences.`
      : 'User has no specific workout style preferences, choose varied exercises.';


    const prompt = `Elite fitness coach. Generate JSON transformation plan for WEEK ${weekNumber}.
    User Profile: Age=${profile.age}yo, Gender=${profile.gender}, Current Weight=${profile.weight}kg, Height=${profile.height}cm.
    Transformation Focus: ${profile.sculptingTargetCategory}.
    Target Composition: Weight=${profile.targets.weight}kg, Body Fat=${profile.targets.bodyFatPercentage}%. Waist=${profile.targets.waistSize}cm.
    Primary Goal: ${profile.goal}, Experience Level: ${profile.experienceLevel}.
    Current Body Comp: BMI=${profile.currentComposition.bmi}, BFP=${profile.currentComposition.bodyFatPercentage}%.
    ${cuisineString}
    ${medicalConditionsPrompt}
    ${workoutPreferencesString}
    ${weeklyProgressionPrompt}
    For each workout day, generate:
    - 3-5 warm-up exercises specifically targeting the muscle groups and movements involved in the main workout.
    - The main exercises for the day, with varied selection.
    - 3-5 cool-down stretches or mobility exercises tailored to the worked muscle groups for recovery.
    Ensure all exercises (warm-up, main, cool-down, rehab) follow the Exercise schema.
    Generate 7 DISTINCT daily diet plans, one for each day of the week (Monday-Sunday), ensuring variety in meals, snacks, and supplements across the week. Each daily diet plan must include 2-3 specific healthy snack options for in-between meals (fruits, nuts, balanced items), providing both name and a brief description for each snack.
    CRITICAL: Estimate a realistic total duration for this transformation, typically between 8 and 16 weeks, for the 'estimatedWeeks' field.
    Return exactly matching schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Updated model for text-based structured generation
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: planSchema }
    });

    const plan: TransformationPlan = JSON.parse(cleanJson(response.text || "{}"));
    
    // Food image generation is removed as per the plan. Meal images are replaced with icons.

    return plan;
  });
};

export const generateExerciseFormPreview = async (
  exerciseName: string, 
  onProgress?: (msg: string) => void
): Promise<{imageUrl: string; description: string}> => {
  await ensureApiKey();
  return withRetry(async () => {
    const ai = getAI();
    if (onProgress) onProgress("Drafting anatomical blueprint...");
    
    const prompt = `A simple, minimalist 2D anatomical diagram of a human body performing the exercise: ${exerciseName}. Instructional medical illustration, clean outlines, white background. Feature: bright red arrows to show direction of motion. Minimal text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Updated model for image generation
      contents: { parts: [{ text: prompt }] }, // Corrected contents format for image models
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return { 
            imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            description: `Anatomical guide for ${exerciseName}.`
          };
        } else if (part.text) {
          console.warn("Exercise image generation returned text instead of image:", part.text);
        }
      }
    }
    throw new Error("No image data returned from model");
  }, 3, 3000);
};

export const getAlternativeExercise = async (currentExercise: Exercise, profile: UserProfile): Promise<Exercise> => {
  await ensureApiKey();
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `Suggest a high-performance alternative exercise for "${currentExercise.name}". Goal: ${profile.goal}. Level: ${profile.experienceLevel}. Return JSON matching schema.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Updated model for text-based structured generation
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: exerciseSchema
      }
    });
    
    return JSON.parse(cleanJson(response.text || "{}")) as Exercise;
  });
};