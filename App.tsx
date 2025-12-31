
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Gender, Goal, TransformationPlan, ProgressEntry, DietPreference, ExperienceLevel, ForgeData, SculptingTargetCategory } from './types';
import { generateTransformationPlan } from './services/geminiService';
import { saveToLocalStorage, loadFromLocalStorage } from './services/localStorageService';
import M3Button from './components/M3Button';
import PlanDisplay from './components/PlanDisplay';
import BodyMap from './components/BodyMap';
import HowItWorksSlidesheet from './components/HowItWorksSlidesheet'; // Import the new component
// Removed ProjectionsDisplay and NavigationButtons imports as their content is now inlined for case 2.
// import ProjectionsDisplay from './components/ProjectionsDisplay'; 
// import NavigationButtons from './components/NavigationButtons';
// Removed Muscle, Grip, HeartPulse due to import errors. Using available icons.
import { User, Ruler, Target, UtensilsCrossed, ChevronRight, Loader2, Sparkles, Sun, Moon, Activity, Scaling, CircleCheck, Cake, Scale, Users, Dumbbell, Hand, Leaf, Cog, Award, Rocket, Plus, ChefHat, Zap, HeartPulse, RefreshCw, Lock, ArrowLeft, Info } from 'lucide-react'; // Added Info icon

const StepperInput: React.FC<{
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  unit?: string;
  step?: number;
  icon?: React.ElementType; // New prop for Lucide icon
}> = ({ label, value, onIncrement, onDecrement, unit, step = 1, icon: Icon }) => (
  <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px] flex flex-col gap-3"> {/* Reduced padding and gap */}
    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"> {/* Reduced font size, added flex and gap */}
      {Icon && <Icon size={14} className="text-[var(--md-sys-color-primary)]" />} {/* Render icon */}
      {label}
    </label>
    <div className="flex items-center justify-between">
      <button 
        onClick={onDecrement}
        className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface)] flex items-center justify-center text-[var(--md-sys-color-primary)] shadow-sm hover:bg-[var(--md-sys-color-primary-container)] transition-colors"
      >
        <div className="w-4 h-0.5 bg-current rounded-full" />
      </button>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-[var(--md-sys-color-on-secondary-container)]">
          {step < 1 ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-sm font-bold text-gray-400">{unit}</span>}
      </div>
      <button 
        onClick={onIncrement}
        className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface)] flex items-center justify-center text-[var(--md-sys-color-primary)] shadow-sm hover:bg-[var(--md-sys-color-primary-container)] transition-colors"
      >
        <div className="relative w-4 h-4">
          <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-current rounded-full -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-current rounded-full -translate-x-1/2" />
        </div>
      </button>
    </div>
  </div>
); 

// Helper function to calculate suggested targets based on category
const calculateSuggestedTargets = (profile: UserProfile, category: SculptingTargetCategory) => {
  const { weight, currentComposition, gender, height } = profile;
  const { bodyFatPercentage, waistSize, neckSize, hipSize, chestSize, armSize, bmi } = currentComposition;

  // Initialize newTargets with default values or existing profile targets.
  // Ensure hipSize is included here for female profiles if applicable.
  let newTargets = {
    ...profile.targets,
    hipSize: profile.gender === Gender.FEMALE ? profile.targets.hipSize || hipSize || 95 : undefined,
  };


  switch (category) {
    case SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS:
      newTargets.weight = Math.max(weight * 0.9, 30); // 10% reduction, min 30kg
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 5, 10); // 5% reduction, min 10%
      newTargets.waistSize = Math.max(waistSize * 0.9, 50); // 10% reduction, min 50cm
      // Fix: Ensure hipSize is updated for females
      if (gender === Gender.FEMALE && newTargets.hipSize !== undefined) newTargets.hipSize = Math.max(newTargets.hipSize * 0.9, 70);
      break;
    case SculptingTargetCategory.MUSCLE_GAIN_BULKING:
      newTargets.weight = weight * 1.05; // 5% increase
      newTargets.bodyFatPercentage = Math.min(bodyFatPercentage + 1, 25); // 1% increase, max 25%
      newTargets.chestSize = chestSize ? chestSize * 1.05 : 105; // 5% increase
      newTargets.armSize = armSize ? armSize * 1.05 : 37; // 5% increase
      break;
    case SculptingTargetCategory.BODY_RECOMPOSITION:
      newTargets.weight = weight * 0.98; // Slight 2% decrease
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 3, 10); // 3% reduction, min 10%
      newTargets.waistSize = Math.max(waistSize * 0.95, 50); // 5% reduction
      newTargets.chestSize = chestSize ? chestSize * 1.02 : 102; // 2% increase
      newTargets.armSize = armSize ? armSize * 1.02 : 36; // 2% increase
      // Fix: Ensure hipSize is updated for females
      if (gender === Gender.FEMALE && newTargets.hipSize !== undefined) newTargets.hipSize = Math.max(newTargets.hipSize * 0.98, 70);
      break;
    case SculptingTargetCategory.STRENGTH_BUILDING:
      newTargets.weight = weight * 1.03; // 3% increase
      newTargets.bodyFatPercentage = bodyFatPercentage; // Stable
      newTargets.chestSize = chestSize ? chestSize * 1.03 : 103; // 3% increase
      newTargets.armSize = armSize ? armSize * 1.03 : 36.5; // 3% increase
      break;
    case SculptingTargetCategory.PERFORMANCE_IMPROVEMENT:
      newTargets.weight = weight * 0.99; // Slight 1% decrease
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 2, 10); // 2% reduction, min 10%
      // Other metrics might be kept stable or slightly optimized for performance
      break;
    case SculptingTargetCategory.IMPROVED_HEALTH_MARKERS:
      // Aim for healthy BMI (18.5-24.9) and BFP (Male 15-20%, Female 20-25%)
      let targetBmi = 22;
      newTargets.weight = Math.max(weight * (targetBmi / bmi), 30); // Adjust weight towards target BMI
      newTargets.bodyFatPercentage = gender === Gender.FEMALE 
        ? Math.min(Math.max(bodyFatPercentage - 3, 20), 25) 
        : Math.min(Math.max(bodyFatPercentage - 3, 15), 20); // Adjust towards healthy range
      break;
    default:
      // Fallback to current values or sensible defaults
      newTargets.weight = weight;
      newTargets.bodyFatPercentage = bodyFatPercentage;
      newTargets.waistSize = waistSize;
      newTargets.chestSize = chestSize;
      newTargets.armSize = armSize;
      // Fix: Ensure hipSize is handled for females
      if (gender === Gender.FEMALE) newTargets.hipSize = hipSize;
      break;
  }

  // Ensure all values are reasonable and formatted
  return {
    weight: Number(newTargets.weight.toFixed(1)),
    bodyFatPercentage: Number(newTargets.bodyFatPercentage.toFixed(1)),
    waistSize: Number(newTargets.waistSize.toFixed(0)),
    chestSize: Number((newTargets.chestSize || 100).toFixed(0)),
    armSize: Number((newTargets.armSize || 35).toFixed(1)),
    // Fix: Ensure hipSize is always present for females if it was before, or defaulted
    hipSize: gender === Gender.FEMALE ? Number((newTargets.hipSize || 95).toFixed(0)) : undefined,
  };
};


const App: React.FC = () => {
  const [step, setStep] = useState<number>(0); // 0 is now the landing page
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analyzing your profile...");
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false); // New state for slidesheet
  
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    height: 175,
    weight: 75,
    gender: Gender.MALE,
    goal: Goal.MUSCLE, // Retain a default goal for the AI prompt
    experienceLevel: ExperienceLevel.BEGINNER,
    cuisine: ['High Protein'],
    customCuisinePreferences: [], // Initialize new field
    dietPreference: DietPreference.BOTH,
    workoutPreferences: ['Free Weights'],
    medicalConditions: [],
    currentComposition: {
      bmi: 24.5,
      bodyFatPercentage: 18,
      waistSize: 85,
      neckSize: 40,
      hipSize: 95, // Default for female, will be ignored for male unless used
      chestSize: 100,
      armSize: 35
    },
    sculptingTargetCategory: SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS, // New default
    targets: {
      weight: 80,
      bodyFatPercentage: 12,
      waistSize: 80,
      hipSize: 90, // Initialize hipSize for targets
      chestSize: 110,
      armSize: 40
    }
  });

  const [plan, setPlan] = useState<TransformationPlan | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [customCuisineInput, setCustomCuisineInput] = useState(''); // State for custom cuisine input
  
  // Renamed from currentDayOfWeekIndex to actualDayOfWeekIndex
  const [actualDayOfWeekIndex, setActualDayOfWeekIndex] = useState<number>(new Date().getDay()); // Default to today's actual day of week
  // New state for completed workouts, keyed by YYYY-MM-DD
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});

  // Load data from local storage on initial mount
  useEffect(() => {
    const currentActualDay = new Date().getDay(); // Get the actual day of the week right now
    const localData = loadFromLocalStorage();

    if (localData) {
      setProfile(localData.profile);
      setPlan(localData.plan);
      setWeekNumber(localData.weekNumber);
      setProgressHistory(localData.progressHistory);

      // Compare stored day with current actual day
      if (localData.actualDayOfWeekIndex !== currentActualDay) {
        // It's a new day, so update the day index and reset completed workouts
        setActualDayOfWeekIndex(currentActualDay);
        setCompletedWorkouts({}); // Reset completed workouts for the new day
        console.log("New day detected! Resetting day index and workout completions.");
      } else {
        // Same day, load as normal
        setActualDayOfWeekIndex(localData.actualDayOfWeekIndex); 
        setCompletedWorkouts(localData.completedWorkouts || {});
      }
      setStep(100); // Jump to plan display if data found
    } else {
      setStep(0); // Show landing page if no local data
      setActualDayOfWeekIndex(currentActualDay); // Initialize with current day
      setCompletedWorkouts({}); // Ensure it's an empty object
    }
  }, []); // Run only once on mount

  // Save data to local storage whenever relevant state changes
  useEffect(() => {
    if (step === 100) { // Only save when the user is past onboarding
      const dataToSave: ForgeData = { profile, plan, weekNumber, progressHistory, actualDayOfWeekIndex, completedWorkouts }; // Include new states
      const timeoutId = setTimeout(() => saveToLocalStorage(dataToSave), 500); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [profile, plan, weekNumber, progressHistory, actualDayOfWeekIndex, completedWorkouts, step]);

  // BFP Calculation
  useEffect(() => {
    const { height, gender } = profile;
    const { waistSize, neckSize, hipSize } = profile.currentComposition;
    let bfp = gender === Gender.FEMALE && hipSize 
      ? 495 / (1.29579 - 0.35004 * Math.log10(waistSize + hipSize - neckSize) + 0.22100 * Math.log10(height)) - 450
      : 495 / (1.0324 - 0.19077 * Math.log10(waistSize - neckSize) + 0.15456 * Math.log10(height)) - 450;

    const validBFP = isNaN(bfp) || bfp <= 0 ? 15 : Number(bfp.toFixed(1));
    const bmi = profile.weight / (Math.pow(profile.height / 100, 2));

    setProfile(prev => ({
      ...prev,
      currentComposition: { ...prev.currentComposition, bmi: Number(bmi.toFixed(1)), bodyFatPercentage: validBFP }
    }));
  }, [profile.height, profile.weight, profile.gender, profile.currentComposition.waistSize, profile.currentComposition.neckSize, profile.currentComposition.hipSize]);

  // Effect to update suggested targets whenever sculptingTargetCategory or currentComposition changes
  useEffect(() => {
    const updatedTargets = calculateSuggestedTargets(profile, profile.sculptingTargetCategory);
    setProfile(prev => ({ ...prev, targets: updatedTargets }));
  }, [profile.sculptingTargetCategory, profile.weight, profile.currentComposition.bodyFatPercentage, profile.currentComposition.waistSize, profile.currentComposition.neckSize, profile.currentComposition.hipSize, profile.currentComposition.chestSize, profile.currentComposition.armSize, profile.currentComposition.bmi, profile.gender, profile.height]);


  const loadingMessages = ["Analyzing metabolic composition...", "Sculpting ratios...", "Calculating hypertrophy...", "Finalizing transformation path..."];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleHowItWorks = () => setShowHowItWorks(prev => !prev); // New toggle function
  const handleNextStep = () => { setError(null); setStep(prev => prev + 1); }
  const handlePrevStep = () => { setError(null); setStep(prev => prev - 1); }
  const handleEditGoals = () => { setError(null); setStep(2); } // New handler to go to step 2

  const toggleSelection = (key: 'cuisine' | 'workoutPreferences' | 'medicalConditions', val: string) => {
    setProfile(prev => {
      const items = prev[key] as string[];
      if (val === 'None') return { ...prev, [key]: [] };
      const isSelected = items.includes(val);
      return { ...prev, [key]: isSelected ? items.filter(item => item !== val) : [...items.filter(i => i !== 'None'), val] };
    });
  };

  const handleAddCustomCuisine = () => {
    const trimmedInput = customCuisineInput.trim();
    if (trimmedInput && !profile.customCuisinePreferences?.includes(trimmedInput)) {
      setProfile(prev => ({
        ...prev,
        customCuisinePreferences: [...(prev.customCuisinePreferences || []), trimmedInput]
      }));
      setCustomCuisineInput(''); // Clear input after adding
    }
  };


  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateTransformationPlan(profile, 1, progressHistory);
      setPlan(generatedPlan);
      setStep(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Forge failed to sync. Check your individual Gemini API key selection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextWeek = weekNumber + 1;
      const updatedPlan = await generateTransformationPlan(profile, nextWeek, progressHistory);
      setPlan(updatedPlan);
      setWeekNumber(nextWeek);
    } catch (err: any) { 
      setError("Refresh failed: " + (err.message || "Unknown error"));
    } finally { 
      setLoading(false); 
    }
  };

  // Centralized function to add or update progress entries
  const handleAddOrUpdateProgress = (newEntry: ProgressEntry) => {
    setProgressHistory(prevHistory => {
      const existingEntryIndex = prevHistory.findIndex(entry => entry.date === newEntry.date);
      if (existingEntryIndex > -1) {
        // Update existing entry
        const updatedHistory = [...prevHistory];
        updatedHistory[existingEntryIndex] = newEntry;
        return updatedHistory;
      } else {
        // Add new entry
        return [...prevHistory, newEntry];
      }
    });
    setProfile(prev => ({...prev, weight: newEntry.weight})); // Update current weight in profile
    // Potentially re-calculate targets if body composition changes significantly
    // and re-generate plan if a major metric changed enough to warrant it.
    // For now, just trigger a plan refresh for the next week.
    handleRefreshPlan(); // Refresh plan with updated progress
  };

  // Renamed to clarify its purpose: marking the workout for the *current calendar day* as complete
  const handleMarkDayWorkoutComplete = useCallback(() => {
    const todayKey = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    setCompletedWorkouts(prev => ({ ...prev, [todayKey]: true }));
    // Do NOT advance actualDayOfWeekIndex here. It reflects the current real day.
  }, []); // No dependencies that would cause it to change after being set up

  const renderStep = () => {
    switch (step) {
      case 0: // New Landing Page
        return (
          <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 animate-in fade-in duration-700 relative z-10">
            <div className="w-28 h-28 bg-[var(--md-sys-color-primary)] rounded-[40px] flex items-center justify-center mb-10 shadow-2xl rotate-6 transition-transform hover:rotate-0">
              <Sparkles className="text-[var(--md-sys-color-on-primary)]" size={56} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[var(--md-sys-color-on-surface)] mb-4 uppercase">Forge</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-xs font-medium">
              Unlock your full potential with Forge, the ultimate body transformation app. Powered by Gemini AI, Forge creates hyper-personalized diet and workout plans tailored precisely to your unique body, goals, and lifestyle.
            </p>
            
            <div className="flex flex-col gap-3 mb-10 text-left w-full max-w-xs">
              <div className="flex items-center gap-3">
                <Target size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Personalized for YOU: Gemini AI adapts to your biometrics, preferences, and progress.</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Dynamic Coaching: Plans evolve with you, ensuring optimal results.</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Privacy First: All your data is securely stored locally on your device.</span>
              </div>
            </div>

            <M3Button onClick={handleNextStep} fullWidth className="h-16 shadow-xl !bg-[var(--md-sys-color-primary)]">
              <Sparkles size={20} /> Start Your Transformation
            </M3Button>
          </div>
        );
      case 1: // Combined Profile Core, Biometrics, and Measurements
        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><User className="text-[var(--md-sys-color-primary)]" /> Your Foundation</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              These essential metrics form the foundation of your personalized plan, enabling Forge to intelligently calibrate your macros, workouts, and progress goals.
            </p>
            <div className="space-y-3"> {/* Reduced space-y */}
              <StepperInput label="Age" value={profile.age} onIncrement={() => setProfile({...profile, age: Math.min(90, profile.age + 1)})} onDecrement={() => setProfile({...profile, age: Math.max(15, profile.age - 1)})} unit="yr" icon={Cake}/>
              <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px]"> {/* Reduced padding */}
                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2"> {/* Reduced font size and mb, added flex and gap */}
                  <Users size={14} className="text-[var(--md-sys-color-primary)]" />
                  Gender
                </label>
                <div className="flex gap-1.5"> {/* Reduced gap */}
                  {Object.values(Gender).map((g) => (
                    <button 
                      key={g} 
                      onClick={() => setProfile({...profile, gender: g})} 
                      className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                        profile.gender === g 
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md' 
                          : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <StepperInput label="Height" value={profile.height} onIncrement={() => setProfile({...profile, height: profile.height + 1})} onDecrement={() => setProfile({...profile, height: Math.max(120, profile.height - 1)})} unit="cm" icon={Ruler}/>
              <StepperInput label="Weight" value={profile.weight} onIncrement={() => setProfile({...profile, weight: profile.weight + 1})} onDecrement={() => setProfile({...profile, weight: Math.max(30, profile.weight - 1)})} unit="kg" icon={Scale}/>
              <StepperInput label="Waist" value={profile.currentComposition.waistSize} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, waistSize: profile.currentComposition.waistSize + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, waistSize: profile.currentComposition.waistSize - 1}})} unit="cm" icon={Ruler}/>
              <StepperInput label="Neck" value={profile.currentComposition.neckSize} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, neckSize: profile.currentComposition.neckSize + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, neckSize: profile.currentComposition.neckSize - 1}})} unit="cm" icon={Ruler}/>
              {profile.gender === Gender.FEMALE && <StepperInput label="Hips" value={profile.currentComposition.hipSize || 95} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, hipSize: (profile.currentComposition.hipSize || 95) + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, hipSize: (profile.currentComposition.hipSize || 95) - 1}})} unit="cm" icon={Ruler}/>}
            </div>
            <div className="mt-8 flex gap-3">
              <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
              <M3Button onClick={handleNextStep} fullWidth>Define Focus</M3Button>
            </div> {/* Reduced mt */}
          </div>
        );
      case 2: // Transformation Focus - formerly Sculpting Targets
        const categories = [
          {
            id: SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS,
            label: "Fat Loss & Weight Loss",
            description: "Reducing body fat for a leaner look, often involving a caloric deficit.",
            icon: Scale,
          },
          {
            id: SculptingTargetCategory.MUSCLE_GAIN_BULKING,
            label: "Muscle Gain (Bulking)",
            description: "Increasing muscle mass and strength, often requiring a calorie surplus and protein.",
            icon: Target, // Changed from Muscle
          },
          {
            id: SculptingTargetCategory.BODY_RECOMPOSITION,
            label: "Body Recomposition",
            description: "Simultaneously losing fat and building muscle for a more defined physique.",
            icon: Sparkles, 
          },
          {
            id: SculptingTargetCategory.STRENGTH_BUILDING,
            label: "Strength Building",
            description: "Increasing lifting capacity or overall power, focusing on progressive overload in weight training.",
            icon: Scaling, // Changed from Grip
          },
          {
            id: SculptingTargetCategory.PERFORMANCE_IMPROVEMENT,
            label: "Performance Improvement",
            description: "Enhancing endurance (running longer), speed, or athletic ability.",
            icon: Activity,
          },
          {
            id: SculptingTargetCategory.IMPROVED_HEALTH_MARKERS,
            label: "Improved Health Markers",
            description: "Lowering disease risk, improving cardiovascular health, bone density, and immune function.",
            icon: CircleCheck, // Changed from HeartPulse
          },
        ];

        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300"> {/* Removed md:flex-row and height classes */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Target className="text-[var(--md-sys-color-primary)]" /> Transformation Focus</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Choose your primary transformation focus. Forge will intelligently calculate optimal body composition targets based on your goals and current metrics.
            </p>
            <div className="space-y-3 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setProfile({ ...profile, sculptingTargetCategory: cat.id })}
                  className={`w-full p-5 rounded-[32px] text-left transition-all border-2 flex items-start gap-4 ${
                    profile.sculptingTargetCategory === cat.id
                      ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] shadow-md'
                      : 'bg-[var(--md-sys-color-secondary-container)] border-[var(--md-sys-color-outline)]/10 text-[var(--md-sys-color-on-secondary-container)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    profile.sculptingTargetCategory === cat.id 
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)]'
                  }`}>
                    <cat.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight text-[var(--md-sys-color-on-surface)]">{cat.label}</h3>
                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-normal mt-1">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Inlined Target Projections and Navigation Buttons (non-sticky) */}
            <div className="p-4 bg-[var(--md-sys-color-surface)]/80 backdrop-blur-xl border-t border-[var(--md-sys-color-outline)]/20 shadow-2xl pt-8 rounded-t-[40px] mt-8"> {/* Added mt-8 and rounded-t for visual separation and removed sticky classes */}
              {/* Display Suggested Targets */}
              <div 
                key={profile.sculptingTargetCategory} // Key to re-trigger animation on category change
                className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 mb-8 animate-in fade-in zoom-in-95 duration-500" // Removed shadow-sm
              >
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4 text-[var(--md-sys-color-primary)]">
                  <Target size={16} /> Forge's Target Projections
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex items-center gap-2">
                    <Scale size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase">Weight</span>
                      <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.weight} kg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase">Body Fat %</span>
                      <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.bodyFatPercentage} %</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase">Waist</span>
                      <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.waistSize} cm</span>
                    </div>
                  </div>
                  {profile.targets.chestSize && (
                    <div className="flex items-center gap-2">
                      {/* Replaced 'Ribs' with 'Ruler' as Ribs is not exported from lucide-react */}
                      <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase">Chest</span>
                        <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.chestSize} cm</span>
                      </div>
                    </div>
                  )}
                  {profile.targets.armSize && (
                    <div className="flex items-center gap-2">
                      <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase">Arm</span>
                        <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.armSize} cm</span>
                      </div>
                    </div>
                  )}
                  {/* Fix: Access hipSize from profile.targets */}
                  {profile.gender === Gender.FEMALE && profile.targets.hipSize && (
                    <div className="flex items-center gap-2">
                      <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase">Hips</span>
                        <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.hipSize} cm</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
                <M3Button onClick={handleNextStep} fullWidth>Assess Readiness</M3Button>
              </div>
            </div>
          </div>
        );
      case 3: // Original case 4: Joint Readiness
        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6 text-center">Joint Readiness</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed text-center">
              Tap on any body regions where you experience discomfort, pain, or have a past injury. This helps Forge&#39;s AI intelligently adapt your workout plan to avoid aggravating these areas and prioritize safe, effective movements.
            </p>
            <BodyMap selectedRegions={profile.medicalConditions} onToggleRegion={(region) => toggleSelection('medicalConditions', region)} />
            <div className="mt-10 flex gap-3">
              <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
              <M3Button onClick={handleNextStep} fullWidth>Choose Workouts</M3Button>
            </div>
          </div>
        );
      case 4: // Original case 5: Workout Style
        const workoutStyles = [
          { name: 'Free Weights', icon: Dumbbell, description: 'Barbells, dumbbells, and kettlebells.' },
          { name: 'Machines', icon: Cog, description: 'Multi-station gym equipment for targeted muscle training.' },
          { name: 'Body Weight', icon: Hand, description: 'Utilizing your own body for resistance.' },
          { name: 'HIIT', icon: Zap, description: 'High-intensity interval training for cardio & strength.' }, // Added HIIT
          { name: 'Aerobics', icon: HeartPulse, description: 'Cardiovascular exercises for endurance and stamina.' }, // Added Aerobics
          { name: 'Combat & Boxing', icon: Activity, description: 'High-energy shadowboxing or kickboxing routines.' }, // Added Combat & Boxing
        ];

        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6">Workout Style</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Select your preferred training methods to help Forge craft effective and enjoyable workout routines.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {workoutStyles.map((style) => (
                <button 
                  key={style.name} 
                  onClick={() => toggleSelection('workoutPreferences', style.name)} 
                  className={`p-5 rounded-[24px] text-left transition-all border-2 flex flex-col items-center justify-center gap-2 ${
                    profile.workoutPreferences.includes(style.name) 
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md border-[var(--md-sys-color-primary)]' 
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)]/10'
                  }`}
                >
                  <style.icon size={24} className="mb-1" />
                  <span className="text-sm font-black uppercase text-center">{style.name}</span>
                  <span className="text-xs text-center opacity-70 mt-1">{style.description}</span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
              <M3Button onClick={handleNextStep} fullWidth>Set Experience</M3Button>
            </div>
          </div>
        );
      case 5: // Original case 6: Experience
        const experienceLevelsData = [
          {
            level: ExperienceLevel.BEGINNER,
            icon: Award,
            description: "Just starting or returning to fitness. Focus on fundamentals."
          },
          {
            level: ExperienceLevel.INTERMEDIATE,
            icon: Activity,
            description: "Consistent training (6+ months). Ready for advanced techniques."
          },
          {
            level: ExperienceLevel.ADVANCED,
            icon: Rocket,
            description: "Years of training. Seeks specialized programming and peak performance."
          }
        ];
        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6">Experience</h2>
            <div className="space-y-4">
              {experienceLevelsData.map((data) => (
                <button 
                  key={data.level} 
                  onClick={() => setProfile({...profile, experienceLevel: data.level})} 
                  className={`w-full p-6 rounded-[32px] text-left border-2 transition-all flex items-center gap-4 ${
                    profile.experienceLevel === data.level 
                      ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)]' 
                      : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline)]/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    profile.experienceLevel === data.level 
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                      : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-primary)]'
                  }`}>
                    <data.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">{data.level}</h3>
                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">{data.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-10 flex gap-3">
              <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
              <M3Button onClick={handleNextStep} fullWidth>Finalize Nutrition</M3Button>
            </div>
          </div>
        );
      case 6: // Original case 7: Nutrition Protocol
        return (
          <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UtensilsCrossed className="text-[var(--md-sys-color-primary)]" /> Nutrition Protocol
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Tailor your meal plan with pre-selected dietary styles or add your own preferred cuisines and dishes.
            </p>

            {/* Custom Cuisine Input */}
            <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px] flex flex-col gap-4 mb-6">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ChefHat size={14} className="text-[var(--md-sys-color-primary)]" />
                Custom Cuisines / Dishes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCuisineInput}
                  onChange={(e) => setCustomCuisineInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCuisine(); } }}
                  placeholder="e.g., Idli Dosa, Chicken Curry..."
                  className="flex-grow bg-[var(--md-sys-color-surface)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] text-sm"
                />
                <M3Button 
                  onClick={handleAddCustomCuisine} 
                  disabled={!customCuisineInput.trim()} 
                  className="!rounded-xl px-4 py-2 text-sm h-auto"
                >
                  <Plus size={16} /> {/* Removed "Add" label */}
                </M3Button>
              </div>
              {profile.customCuisinePreferences && profile.customCuisinePreferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.customCuisinePreferences.map((c, idx) => (
                    <span key={idx} className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {c}
                      <button 
                        onClick={() => setProfile(prev => ({ 
                          ...prev, 
                          customCuisinePreferences: prev.customCuisinePreferences?.filter(item => item !== c) 
                        }))} 
                        className="ml-1 text-[var(--md-sys-color-on-primary-container)]/80 hover:text-[var(--md-sys-color-on-primary-container)] text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Predefined cuisine buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Indian', 'Mediterranean', 'High Protein', 'Asian Fusion', 'Vegetarian', 'Vegan'].map((c) => (
                <button 
                  key={c} 
                  onClick={() => toggleSelection('cuisine', c)} 
                  className={`p-5 rounded-[24px] text-sm font-black uppercase border-2 transition-all ${profile.cuisine.includes(c) ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-md' : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)]/10'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs rounded-3xl font-bold">{error}</div>}

            <div className="mt-10 flex gap-3">
              <M3Button onClick={handlePrevStep} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
              <M3Button onClick={handleSubmit} fullWidth disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Build Transformation'}
              </M3Button>
            </div>
            {loading && <p className="text-center text-xs font-black uppercase text-[var(--md-sys-color-primary)] mt-3">{loadingMessage}</p>}
          </div>
        );
      case 100:
        return plan ? (
          <div className="px-4 py-6">
            <PlanDisplay 
              plan={plan} 
              goal={profile.goal} 
              profile={profile}
              progressHistory={progressHistory}
              currentWeek={weekNumber}
              onAddProgress={handleAddOrUpdateProgress} // Pass the centralized handler
              onRefreshPlan={handleRefreshPlan}
              onUpdatePlanLocally={(p) => setPlan(p)}
              isRefreshing={loading}
              onEditGoals={handleEditGoals} // Pass the new handler
              actualDayOfWeekIndex={actualDayOfWeekIndex} // Pass renamed prop
              completedWorkouts={completedWorkouts}       // Pass new prop
              onMarkDayWorkoutComplete={handleMarkDayWorkoutComplete} // Pass renamed handler
            />
          </div>
        ) : null;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] flex flex-col max-w-lg mx-auto overflow-x-hidden relative">
      <header className="p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[var(--md-sys-color-primary)] rounded-lg flex items-center justify-center"><Sparkles className="text-[var(--md-sys-color-on-primary)]" size={16} /></div>
           <span className="font-bold text-sm uppercase tracking-tighter">Forge Elite</span>
        </div>
        <div className="flex items-center gap-3">
          {/* How it Works Button */}
          <button onClick={toggleHowItWorks} className="p-2 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center gap-2 text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] transition-colors text-xs font-semibold uppercase tracking-tight">
            <Info size={18} /> How it Works
          </button>
          {/* Dark/Light Mode Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-[var(--md-sys-color-secondary-container)]">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        </div>
      </header>
      
      <main className="flex-grow relative z-10 pb-6">
        {renderStep()}
      </main>
      
      {/* How it Works Slidesheet */}
      <HowItWorksSlidesheet isOpen={showHowItWorks} onClose={toggleHowItWorks} />
    </div>
  );
};

export default App;