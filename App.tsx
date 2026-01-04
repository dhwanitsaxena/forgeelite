
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Gender, Goal, TransformationPlan, ProgressEntry, DietPreference, ExperienceLevel, ForgeData, SculptingTargetCategory } from './types';
import { generateTransformationPlan } from './services/geminiService';
import { onAuthStateChange, logOut } from './services/authService';
import { saveData, loadData } from './services/firestoreService';
import PlanDisplay from './components/PlanDisplay';
import HowItWorksSlidesheet from './components/HowItWorksSlidesheet';

// Component Imports
import LandingPage from './components/onboarding/LandingPage';
import FoundationStep from './components/onboarding/FoundationStep';
import FocusStep from './components/onboarding/FocusStep';
import JointReadinessStep from './components/onboarding/JointReadinessStep';
import WorkoutStyleStep from './components/onboarding/WorkoutStyleStep';
import ExperienceStep from './components/onboarding/ExperienceStep';
import NutritionStep from './components/onboarding/NutritionStep';
import Login from './components/Login';
import SignUp from './components/SignUp';
import GeneratingPlanIllustration from './components/GeneratingPlanIllustration';


// Utility & Icon Imports
import { calculateSuggestedTargets } from './utils/targetCalculations';
import { Loader2, Sparkles, Sun, Moon, Info, LogOut, Rocket, UserCheck, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); 
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [authLoadingMessage, setAuthLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false); 
  const [showAuth, setShowAuth] = useState<boolean>(false); 
  const [showLogin, setShowLogin] = useState<boolean>(true); 
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false); // New flag to track if data has been loaded
  
  const [profile, setProfile] = useState<UserProfile>({
    age: 25, height: 175, weight: 75, gender: Gender.MALE, goal: Goal.MUSCLE,
    experienceLevel: ExperienceLevel.BEGINNER, cuisine: ['High Protein'], customCuisinePreferences: [],
    dietPreference: DietPreference.BOTH, workoutPreferences: ['Free Weights'], medicalConditions: [],
    currentComposition: { bmi: 24.5, bodyFatPercentage: 18, waistSize: 85, neckSize: 40, hipSize: 95 },
    sculptingTargetCategory: SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS,
    targets: { weight: 80, bodyFatPercentage: 12, waistSize: 80, hipSize: 90 }
  });

  const [plan, setPlan] = useState<TransformationPlan | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [customCuisineInput, setCustomCuisineInput] = useState('');
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setShowAuth(false); 
        setLoading(true);
        setLoadingMessage("Loading your Forge data...");
        try {
          const userData = await loadData(currentUser.uid);
          if (userData && userData.plan) { 
            setProfile(userData.profile);
            setPlan(userData.plan);
            setWeekNumber(userData.weekNumber);
            setProgressHistory(userData.progressHistory || []);
            setCompletedWorkouts(userData.completedWorkouts || {});
            setCurrentWeekStartDate(userData.currentWeekStartDate || new Date().toISOString().slice(0, 10));
            setStep(100); 
          } else if (userData) { 
            setProfile(userData.profile);
            setStep(1); 
          } else {
             setStep(0);
          }
        } catch (err) {
          console.error("Failed to load data:", err);
          setError("Failed to load your progress.");
        } finally {
          setIsDataLoaded(true); // Mark data as loaded
          setLoading(false);
          setAuthLoadingMessage(null); 
        }
      } else {
        // When user is null (logged out), reset state
        setStep(0);
        setPlan(null);
        setIsDataLoaded(false); // Reset loaded flag
        setProfile({
            age: 25, height: 175, weight: 75, gender: Gender.MALE, goal: Goal.MUSCLE,
            experienceLevel: ExperienceLevel.BEGINNER, cuisine: ['High Protein'], customCuisinePreferences: [],
            dietPreference: DietPreference.BOTH, workoutPreferences: ['Free Weights'], medicalConditions: [],
            currentComposition: { bmi: 24.5, bodyFatPercentage: 18, waistSize: 85, neckSize: 40, hipSize: 95 },
            sculptingTargetCategory: SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS,
            targets: { weight: 80, bodyFatPercentage: 12, waistSize: 80, hipSize: 90 }
        });
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only save data if there is a user AND data has been initially loaded
    if (user && isDataLoaded) {
      const dataToSave: ForgeData = { profile, plan, weekNumber, progressHistory, completedWorkouts, currentWeekStartDate };
      // Save immediately if the plan has just been generated or during onboarding
      if (step >= 1 && step < 100 || (step === 100 && plan)) {
        saveData(user.uid, dataToSave);
      } else {
        // Debounce save for other updates
        const timeoutId = setTimeout(() => saveData(user.uid, dataToSave), 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [profile, plan, weekNumber, progressHistory, completedWorkouts, currentWeekStartDate, user, step, isDataLoaded]);

  useEffect(() => { 
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    // Recalculate targets whenever profile foundation metrics or category changes.
    // This ensures targets are always up-to-date with the user's current data.
    const updatedTargets = calculateSuggestedTargets(profile, profile.sculptingTargetCategory);
    
    // Check if targets actually changed to prevent infinite loop
    if (JSON.stringify(updatedTargets) !== JSON.stringify(profile.targets)) {
       setProfile(prev => ({ ...prev, targets: updatedTargets }));
    }
  }, [
    profile.sculptingTargetCategory, 
    profile.weight, 
    profile.height, 
    profile.gender,
    // Using stringify for deep object comparison in dependency array
    JSON.stringify(profile.currentComposition) 
  ]);

  const handleStartTransformation = () => {
    if (user) {
        if (!plan) {
            setStep(1); 
        } else {
            setStep(100); 
        }
    } else {
      setShowAuth(true); 
    }
  };

  const handleLogout = async () => {
      await logOut();
      // The onAuthStateChange listener will handle the state reset.
  }

  const handleMarkDayWorkoutComplete = (dateKey: string) => {
    setCompletedWorkouts(prev => ({ ...prev, [dateKey]: true }));
  };

  const handleSubmitOnboarding = async () => {
    if (!user) { setError("You must be logged in to create a plan."); return; }
    setLoading(true);
    setLoadingMessage("Generating your plan...");
    setError(null);
    try {
      const generatedPlan = await generateTransformationPlan(profile, 1, progressHistory);
      const todayDateKey = new Date().toISOString().slice(0, 10);
      setPlan(generatedPlan);
      setWeekNumber(1);
      setCurrentWeekStartDate(todayDateKey);
      setStep(100);
    } catch (err: any) {
      setError(err.message || "Forge failed to sync. Check API key.");
       setStep(6); // Go back to the nutrition step on failure
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = (entry: ProgressEntry) => {
    setProgressHistory(prev => [...prev, entry]);
  };

  const handleRefreshPlan = async () => {
    if (!user) return;
    setLoading(true);
    setLoadingMessage("Adapting your plan...");
    try {
        const nextWeek = weekNumber + 1;
        // Note: progressHistory here might not include the very latest entry due to closure scope,
        // but the data is saved and will be available for next interactions.
        const generatedPlan = await generateTransformationPlan(profile, nextWeek, progressHistory);
        setPlan(generatedPlan);
        setWeekNumber(nextWeek);
        setCompletedWorkouts({});
        setCurrentWeekStartDate(new Date().toISOString().slice(0, 10));
    } catch (err: any) {
        console.error(err);
        setError("Failed to update plan.");
    } finally {
        setLoading(false);
    }
  };
  
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

  const renderContent = () => {
    if (authLoadingMessage) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Rocket className="animate-bounce text-[var(--md-sys-color-primary)] mb-8" size={64} />
            <h3 className="text-lg font-bold text-[var(--md-sys-color-primary)]">{authLoadingMessage}</h3>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Get ready to start your transformation!</p>
          </div>
        );
    }
    
    if (loading) {
        if (loadingMessage === 'Generating your plan...') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <GeneratingPlanIllustration />
                    <h3 className="font-bold text-lg text-[var(--md-sys-color-on-surface)] mt-4">Generating your plan...</h3>
                    <p className="text-sm text-gray-500 mt-2">Hang tight while we tailor your transformation.</p>
                </div>
            )
        }
        return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="animate-spin h-12 w-12 mb-4" /><span>{loadingMessage}</span></div>;
    }

    if (showAuth && !user) {
      return (
        <div className="p-6 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-[var(--md-sys-color-primary-container)] rounded-full mx-auto mb-6">
            {showLogin ? (
              <UserCheck className="text-[var(--md-sys-color-primary)]" size={40} />
            ) : (
              <UserPlus className="text-[var(--md-sys-color-primary)]" size={40} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            {showLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          {showLogin ? <Login setAuthLoadingMessage={setAuthLoadingMessage} /> : <SignUp setAuthLoadingMessage={setAuthLoadingMessage} />}
          <button onClick={() => setShowLogin(!showLogin)} className="mt-4 text-sm text-center w-full text-[var(--md-sys-color-primary)] font-semibold">
            {showLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      );
    }

    switch (step) {
      case 0: return <LandingPage onStartTransformation={handleStartTransformation} />;
      case 1: return <FoundationStep profile={profile} setProfile={setProfile} onNext={() => setStep(2)} onPrev={() => setStep(0)} />;
      case 2: return <FocusStep profile={profile} setProfile={setProfile} onNext={() => setStep(3)} onPrev={() => setStep(1)} />;
      case 3: return <JointReadinessStep profile={profile} onToggleRegion={(region) => toggleSelection('medicalConditions', region)} onNext={() => setStep(4)} onPrev={() => setStep(2)} />;
      case 4: return <WorkoutStyleStep profile={profile} onToggleSelection={toggleSelection} onNext={() => setStep(5)} onPrev={() => setStep(3)} />;
      case 5: return <ExperienceStep profile={profile} setProfile={setProfile} onNext={() => setStep(6)} onPrev={() => setStep(4)} />;
      case 6: return <NutritionStep profile={profile} setProfile={setProfile} customCuisineInput={customCuisineInput} setCustomCuisineInput={setCustomCuisineInput} onToggleSelection={toggleSelection} onHandleAddCustomCuisine={handleAddCustomCuisine} onSubmit={handleSubmitOnboarding} onPrev={() => setStep(5)} loading={loading} loadingMessage={loadingMessage} error={error} />;
      case 100: return plan ? <PlanDisplay plan={plan} goal={profile.goal} profile={profile} progressHistory={progressHistory} currentWeek={weekNumber} onAddProgress={handleAddProgress} onRefreshPlan={handleRefreshPlan} onUpdatePlanLocally={(p) => setPlan(p)} isRefreshing={loading} onEditGoals={() => setStep(2)} completedWorkouts={completedWorkouts} onMarkDayWorkoutComplete={handleMarkDayWorkoutComplete} currentWeekStartDate={currentWeekStartDate} /> : <div>Error: Plan not found.</div>;
      default: setStep(0); return null;
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
          <button onClick={() => setShowHowItWorks(p => !p)} className="p-2 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center gap-2 text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] transition-colors text-xs font-semibold uppercase tracking-tight">
            <Info size={18} /> How it Works
          </button>
          <button onClick={() => setIsDarkMode(p => !p)} className="p-2 rounded-full bg-[var(--md-sys-color-secondary-container)]">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          {user && (
             <button onClick={handleLogout} className="p-2 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-error-container)]">
                <LogOut size={20}/>
             </button>
          )}
        </div>
      </header>
      
      <main className="flex-grow relative z-10 pb-[120px]">
        {renderContent()}
      </main>
      
      <HowItWorksSlidesheet isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
};

export default App;
