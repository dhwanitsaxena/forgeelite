
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum Goal {
  LEAN = 'Getting Lean',
  MUSCLE = 'Building Muscle'
}

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum DietPreference {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg',
  BOTH = 'Both'
}

export enum SculptingTargetCategory {
  FAT_LOSS_WEIGHT_LOSS = 'Fat Loss & Weight Loss',
  MUSCLE_GAIN_BULKING = 'Muscle Gain (Bulking)',
  BODY_RECOMPOSITION = 'Body Recomposition ("Toning")',
  STRENGTH_BUILDING = 'Strength Building',
  PERFORMANCE_IMPROVEMENT = 'Performance Improvement',
  IMPROVED_HEALTH_MARKERS = 'Improved Health Markers',
}

export interface BodyComposition {
  bmi: number;
  bodyFatPercentage: number;
  waistSize: number;
  neckSize: number;
  hipSize?: number;
  chestSize?: number;
  armSize?: number;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  cuisine: string[];
  customCuisinePreferences?: string[]; // New field for free-form user input
  dietPreference: DietPreference;
  workoutPreferences: string[];
  medicalConditions: string[];
  currentComposition: BodyComposition;
  sculptingTargetCategory: SculptingTargetCategory; // New field
  targets: {
    weight: number;
    bodyFatPercentage: number;
    waistSize: number;
    hipSize?: number; // Added hipSize to targets
    chestSize?: number;
    armSize?: number;
  };
}

export interface ForgeData {
  profile: UserProfile;
  plan: TransformationPlan | null;
  weekNumber: number;
  progressHistory: ProgressEntry[];
  completedWorkouts: Record<string, boolean>; // New field for persisting completed workout days (YYYY-MM-DD -> boolean)
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  prepTime?: string;
  imageUrl?: string;
}

export interface DietPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: { name: string; description: string; }[]; // Updated to structured snack objects
  supplements: string[];
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  tips: string;
  isAlternative?: boolean;
  isRehab?: boolean;
  isVariation?: boolean;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  warmUpExercises: Exercise[]; // New: Warm-up exercises
  exercises: Exercise[];
  rehabExercises?: Exercise[]; // Added optional rehab exercises
  coolDownExercises: Exercise[]; // New: Cool-down exercises
  cardio?: {
    type: string;
    duration: string;
    intensity: string;
  };
}

export interface TransformationPlan {
  estimatedWeeks: number;
  timeframe: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  dailyDietPlans: DietPlan[]; // Changed from dietPlan: DietPlan to dailyDietPlans: DietPlan[]
  workoutPlan: WorkoutDay[];
  summary: string;
  progressStatus: 'on-track' | 'off-track' | 'pending';
  courseCorrection?: string;
  rehabNotice?: string;
}

export interface ProgressEntry {
  date: string;
  weekNumber: number;
  weight: number;
  bodyFat?: number;
  measurements: {
    waist?: number;
    neck?: number;
    hips?: number;
    chest?: number;
    arms?: number;
  };
}