import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Gender, Goal, TransformationPlan, ProgressEntry, DietPreference, ExperienceLevel, ForgeData, SculptingTargetCategory } from './types';
import { generateTransformationPlan } from './services/geminiService';
import { saveToLocalStorage, loadFromLocalStorage } from './services/localStorageService';
import M3Button from './components/M3Button';
import PlanDisplay from './components/PlanDisplay';
import HowItWorksSlidesheet from './components/HowItWorksSlidesheet';

// Extracted Components & Utilities
import StepperInput from './components/StepperInput'; // NEW: Extracted StepperInput
import { calculateSuggestedTargets } from './utils/targetCalculations'; // NEW: Extracted utility
import LandingPage from './components/onboarding/LandingPage'; // NEW: Extracted step
import FoundationStep from './components/onboarding/FoundationStep'; // NEW: Extracted step
import FocusStep from './components/onboarding/FocusStep'; // NEW: Extracted step
import JointReadinessStep from './components/onboarding/JointReadinessStep'; // NEW: Extracted step
import WorkoutStyleStep from './components/onboarding/WorkoutStyleStep'; // NEW: Extracted step
import ExperienceStep from './components/onboarding/ExperienceStep'; // NEW: Extracted step
import NutritionStep from './components/onboarding/NutritionStep'; // NEW: Extracted step

import { User, Ruler, Target, UtensilsCrossed, Loader2, Sparkles, Sun, Moon, Activity, Scaling, CircleCheck, Cake, Scale, Users, Dumbbell, Hand, Cog, Award, Rocket, Plus, ChefHat, Zap, HeartPulse, RefreshCw, Lock, ArrowLeft, Info } from 'lucide-react'; // Removed ChevronRight and Leaf


// Centralized loading messages
const loadingMessages = ["Analyzing metabolic composition...", "Sculpting ratios...", "Calculating hypertrophy...", "Finalizing transformation path..."];


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
  
  // `actualDayOfWeekIndex` state removed. The current day will be fetched directly where needed.
  // New state for completed workouts, keyed by YYYY-MM-DD
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  // Load data from local storage on initial mount
  useEffect(() => {
    const localData = loadFromLocalStorage();

    if (localData) {
      setProfile(localData.profile);
      setPlan(localData.plan);
      setWeekNumber(localData.weekNumber);
      setProgressHistory(localData.progressHistory);
      setCompletedWorkouts(localData.completedWorkouts || {}); // Load completedWorkouts without reset
      setCurrentWeekStartDate(localData.currentWeekStartDate || new Date().toISOString().slice(0, 10));
      setStep(100); // Jump to plan display if data found
    } else {
      setStep(0); // Show landing page if no local data
      setCompletedWorkouts({}); // Ensure it's an empty object
      setCurrentWeekStartDate(new Date().toISOString().slice(0, 10)); // Default for fresh start
    }
  }, []); // Run only once on mount

  // Save data to local storage whenever relevant state changes
  useEffect(() => {
    if (step === 100) { // Only save when the user is past onboarding
      const dataToSave: ForgeData = { profile, plan, weekNumber, progressHistory, completedWorkouts, currentWeekStartDate }; // Removed actualDayOfWeekIndex
      const timeoutId = setTimeout(() => saveToLocalStorage(dataToSave), 500); // Debounce save
      return () => clearTimeout(timeoutId);
    }
  }, [profile, plan, weekNumber, progressHistory, completedWorkouts, currentWeekStartDate, step]); // Removed actualDayOfWeekIndex

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
      const todayDateKey = new Date().toISOString().slice(0, 10);
      setPlan(generatedPlan);
      setWeekNumber(1); // Ensure weekNumber is 1 for the first plan
      setCurrentWeekStartDate(todayDateKey); // Set for the first week
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
      // Calculate the start date for the *next* week
      const prevStartDate = new Date(currentWeekStartDate);
      prevStartDate.setDate(prevStartDate.getDate() + 7); // Move to the start of the next week
      const newCurrentWeekStartDate = prevStartDate.toISOString().slice(0, 10);

      const updatedPlan = await generateTransformationPlan(profile, nextWeek, progressHistory);
      setPlan(updatedPlan);
      setWeekNumber(nextWeek);
      setCurrentWeekStartDate(newCurrentWeekStartDate); // Update for the next week
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

  // Modified to accept a dateKey for the workout being marked complete
  const handleMarkDayWorkoutComplete = useCallback((dateKey: string) => {
    setCompletedWorkouts(prev => ({ ...prev, [dateKey]: true }));
  }, []); // No dependencies that would cause it to change after being set up

  const renderStep = () => {
    switch (step) {
      case 0:
        return <LandingPage onStartTransformation={handleNextStep} />;
      case 1:
        return (
          <FoundationStep
            profile={profile}
            setProfile={setProfile}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 2:
        return (
          <FocusStep
            profile={profile}
            setProfile={setProfile}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 3:
        return (
          <JointReadinessStep
            profile={profile}
            onToggleRegion={(region) => toggleSelection('medicalConditions', region)}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 4:
        return (
          <WorkoutStyleStep
            profile={profile}
            onToggleSelection={toggleSelection}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 5:
        return (
          <ExperienceStep
            profile={profile}
            setProfile={setProfile}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 6:
        return (
          <NutritionStep
            profile={profile}
            setProfile={setProfile}
            customCuisineInput={customCuisineInput}
            setCustomCuisineInput={setCustomCuisineInput}
            onToggleSelection={toggleSelection}
            onHandleAddCustomCuisine={handleAddCustomCuisine}
            onSubmit={handleSubmit}
            onPrev={handlePrevStep}
            loading={loading}
            loadingMessage={loadingMessage}
            error={error}
          />
        );
      case 100:
        return plan ? (
          <div className="px-4">
            <PlanDisplay 
              plan={plan} 
              goal={profile.goal} 
              profile={profile}
              progressHistory={progressHistory}
              currentWeek={weekNumber}
              onAddProgress={handleAddOrUpdateProgress}
              onRefreshPlan={handleRefreshPlan}
              onUpdatePlanLocally={(p) => setPlan(p)}
              isRefreshing={loading}
              onEditGoals={handleEditGoals}
              completedWorkouts={completedWorkouts}
              onMarkDayWorkoutComplete={handleMarkDayWorkoutComplete}
              currentWeekStartDate={currentWeekStartDate}
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
      
      <main className="flex-grow relative z-10 pb-[120px]">
        {renderStep()}
      </main>
      
      {/* How it Works Slidesheet */}
      <HowItWorksSlidesheet isOpen={showHowItWorks} onClose={toggleHowItWorks} />
    </div>
  );
};

export default App;