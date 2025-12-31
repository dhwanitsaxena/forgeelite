# Forge - Body Transformation App: Architecture and User Flows

This document outlines the architectural design and key user flows for the Forge body transformation application.

## 1. Architecture Design

Forge is built as a Single-Page Application (SPA) using React, designed for mobile-first user experience and Progressive Web App (PWA) capabilities.

### 1.1. Technology Stack

*   **Frontend Framework:** React (with TypeScript) for building dynamic user interfaces.
*   **Styling:** Tailwind CSS for utility-first CSS, enabling rapid and responsive UI development. Custom CSS variables (prefixed `md-sys-color-`) are used for Material Design 3 inspired theming (light/dark mode).
*   **Icons:** `lucide-react` for a consistent and modern icon set.
*   **Gemini AI Integration:** `@google/genai` SDK for interacting with Google Gemini models.
*   **Data Persistence:**
    *   **Local Storage:** `localStorageService.ts` handles saving and loading all application state (`UserProfile`, `TransformationPlan`, `ProgressEntry`, `completedWorkouts`, `currentWeekStartDate`) directly to the browser's local storage. This ensures offline availability and persistence across sessions without a backend database.
    *   **API Key Management:** `geminiService.ts` interacts with `window.aistudio.hasSelectedApiKey()` and `window.aistudio.openSelectKey()` for managing the Gemini API key within the Google AI Studio environment, adhering to specific guidelines for Veo models.
*   **PWA Features:**
    *   `manifest.json`: Provides metadata for app installation (e.g., home screen icon, app name).
    *   `service-worker.js`: Implements caching strategies for offline functionality and faster subsequent loads.
*   **Module System:** ES Modules, directly imported in `index.html`, leveraging `esm.sh` for external dependencies, simplifying the build process for smaller projects.

### 1.2. Key Components and Services

*   **`App.tsx` (Root Component):**
    *   Manages the main application state (user profile, plan, loading, errors, current step).
    *   Orchestrates the multi-step onboarding process.
    *   Handles theme toggling (dark/light mode).
    *   Invokes `geminiService` for plan generation and refresh.
    *   Integrates `localStorageService` for data persistence.
    *   Renders different sections of the app based on the current `step` state.
*   **`components/PlanDisplay.tsx`:**
    *   Displays the user's generated `TransformationPlan`.
    *   Manages navigation between overview, daily diet, workout plan, and progress tabs.
    *   Provides functionality for swapping exercises (via `geminiService`).
    *   Handles marking workout sessions as complete and triggering weekly check-ins.
    *   Integrates `ProgressTracker` for detailed progress visualization and logging.
    *   Displays `ExerciseGuideModal` on demand.
*   **`components/ProgressTracker.tsx`:**
    *   Allows users to log weekly weight and measurement progress.
    *   Visualizes weight trend over time.
    *   Enables editing of past progress entries.
    *   Integrates with `App.tsx` to update the global `progressHistory`.
*   **`components/BodyMap.tsx`:**
    *   An interactive SVG component allowing users to select body regions where they experience pain or have medical conditions.
    *   Provides visual feedback for selected regions.
*   **`components/ExerciseGuideModal.tsx`:**
    *   A modal that displays detailed information about an exercise, including tips.
    *   Provides a direct link to YouTube for form tutorials.
*   **`components/HowItWorksSlidesheet.tsx`:**
    *   A slidesheet component explaining the core functionality and AI-powered aspects of Forge.
*   **`components/M3Button.tsx`:**
    *   A reusable button component implementing Material Design 3 principles.
*   **`services/geminiService.ts`:**
    *   Encapsulates all interactions with the Google Gemini API.
    *   Includes `ensureApiKey` for AI Studio environment compatibility.
    *   Implements robust `withRetry` logic with exponential backoff for API calls.
    *   Defines structured `responseSchema` for `TransformationPlan` and `Exercise` to ensure reliable JSON output from Gemini.
    *   Provides `generateTransformationPlan` and `getAlternativeExercise` functions.
*   **`services/localStorageService.ts`:**
    *   Provides simple utility functions (`saveToLocalStorage`, `loadFromLocalStorage`) for managing application data in the browser's local storage.
*   **`types.ts`:**
    *   Defines all TypeScript interfaces and enums for the application's data models (e.g., `UserProfile`, `TransformationPlan`, `Exercise`, `ProgressEntry`).

### 1.3. AI Integration (Gemini)

*   **Plan Generation (`generateTransformationPlan`):** Takes a detailed `UserProfile`, current `weekNumber`, and `progressHistory` as input. It crafts a comprehensive prompt for Gemini, requesting a 7-day diet plan (with breakfast, lunch, dinner, snacks, and supplements) and a 7-day workout plan (with warm-up, main, rehab, and cool-down exercises), all conforming to a strict JSON schema. The model used is `'gemini-3-flash-preview'`.
*   **Exercise Alternatives (`getAlternativeExercise`):** When a user requests an alternative for a specific exercise, Gemini generates a suitable replacement based on the user's profile and goal, ensuring variety and adherence to preferences. The model used is `'gemini-3-flash-preview'`.
*   **Safety Protocols:** `medicalConditions` are included in the prompt to Gemini, instructing it to avoid aggravating exercises and suggest mild rehabilitation protocols where applicable.

## 2. User Flows

The application follows a stepped onboarding process for new users, transitioning to a plan display and progress tracking interface for established users.

### 2.1. Initial Onboarding (Steps 0-6)

This flow is designed to gather comprehensive user data for personalized plan generation.

1.  **Landing Page (Step 0):**
    *   **Description:** Welcomes the user to Forge, highlights key features (AI personalization, dynamic coaching, local data privacy).
    *   **Action:** "Start Your Transformation" button.
2.  **Your Foundation (Step 1):**
    *   **Description:** Gathers core biometrics and physical measurements.
    *   **Input:** Age (stepper), Gender (radio buttons), Height (stepper), Weight (stepper), Waist (stepper), Neck (stepper), Hips (stepper, for females only).
    *   **Calculations:** BMI and Body Fat Percentage are dynamically calculated and updated in the profile based on these inputs.
    *   **Navigation:** "Define Focus" (Next), "Back" (Previous).
3.  **Transformation Focus (Step 2):**
    *   **Description:** User selects their primary body transformation goal from a list of categories (e.g., Fat Loss, Muscle Gain, Body Recomposition).
    *   **Input:** Selection of `SculptingTargetCategory` via styled buttons.
    *   **Dynamic Update:** "Forge's Target Projections" section dynamically calculates and displays suggested target metrics (weight, body fat, waist, etc.) based on the chosen category and current biometrics.
    *   **Navigation:** "Assess Readiness" (Next), "Back" (Previous).
4.  **Joint Readiness (Step 3):**
    *   **Description:** User identifies areas of discomfort, pain, or past injuries using an interactive `BodyMap` (front/back view).
    *   **Input:** Tapping on body regions to add/remove `medicalConditions`. An option for "Full Mobility" (no issues) is also available.
    *   **Feedback:** Displays "Safety Protocols Active" warning if issues are selected.
    *   **Navigation:** "Choose Workouts" (Next), "Back" (Previous).
5.  **Workout Style (Step 4):**
    *   **Description:** User selects preferred workout styles (e.g., Free Weights, Machines, HIIT).
    *   **Input:** Multi-selection via styled buttons.
    *   **Navigation:** "Set Experience" (Next), "Back" (Previous).
6.  **Experience (Step 5):**
    *   **Description:** User selects their fitness experience level (Beginner, Intermediate, Advanced).
    *   **Input:** Single selection via styled buttons.
    *   **Navigation:** "Finalize Nutrition" (Next), "Back" (Previous).
7.  **Nutrition Protocol (Step 6):**
    *   **Description:** User specifies dietary preferences, including pre-defined cuisines and an option to add custom cuisines/dishes.
    *   **Input:** Multi-selection for pre-defined cuisines, text input for custom cuisines.
    *   **Action:** "Finalize & Build Transformation" button triggers `handleSubmit`, which calls `generateTransformationPlan` via `geminiService`.
    *   **Loading State:** Displays `Loader2` icon and rotating loading messages while the plan is being generated.
    *   **Error Handling:** Displays error messages if plan generation fails.
    *   **Navigation:** "Back" (Previous).

### 2.2. Post-Onboarding (Plan Display - Step 100)

Once a plan is generated, the user is directed to the `PlanDisplay` component, which serves as the main dashboard.

1.  **Overview Tab:**
    *   **Description:** Displays a summary of the transformation timeline, daily calorie target, macro split, sculpting benchmarks (current vs. target), and a biomechanical insight (plan summary).
    *   **Interaction:** "Edit Goals" button allows users to return to **Step 2** of the onboarding to modify their transformation focus.
2.  **Diet Tab:**
    *   **Description:** Presents a detailed 7-day diet plan. Users can navigate between days using carousel buttons.
    *   **Content:** For each day, it shows Breakfast, Lunch, Dinner (with name, description, calories), Snacks (name and description), and Supplements.
3.  **Workout Tab:**
    *   **Description:** Displays the 7-day workout plan, aligned so "today's" workout is the first card. Users can navigate between days.
    *   **Content:** For each day: Warm-up, Main Exercises, Rehabilitation Exercises (if applicable), and Cool-down.
    *   **Interactions:**
        *   **Exercise Guide:** Each exercise has a "Guide" button that opens `ExerciseGuideModal` with tips and a YouTube search link.
        *   **Swap Exercise:** "Alternative" button allows users to request a different exercise from Gemini if they don't like or can't perform a specific one.
        *   **Mark Session Complete:** For "today's" workout, a button allows marking the session as complete. A toast notification confirms completion.
4.  **Progress Tab:**
    *   **Description:** Displays a weight trend chart and a history of logged measurements.
    *   **Interaction:**
        *   **Log Weekly Measurements:** Button to open a form for logging current weight and body measurements (waist, neck, hips, chest, arms). This button is enabled only after all workouts for the current week are marked complete and the end of the week is reached (`isWeeklyCheckInEnabled`).
        *   **Edit History:** A pencil icon next to each history entry allows editing past measurements.
        *   **Weekly Check-in:** After logging progress, `onAddEntry` is called, which triggers `handleRefreshPlan` in `App.tsx` to generate the plan for the *next* week, incorporating the latest progress.

### 2.3. Ancillary Flows

*   **Dark/Light Mode Toggle:** A button in the header switches the application's theme, affecting CSS variables.
*   **"How it Works" Slidesheet:** An "Info" button in the header opens a modal slidesheet explaining Forge's AI capabilities and data utilization.
*   **Local Storage Save/Load:** The application state is automatically saved to local storage on changes (debounced) and loaded on initial mount, providing data persistence across sessions.
*   **API Key Selection:** When `geminiService` attempts to make an API call, it first checks if an API key is selected via `window.aistudio.hasSelectedApiKey()`. If not, it prompts the user to select one using `window.aistudio.openSelectKey()`, ensuring billing requirements are met for specific models (like Veo, although not currently used).

## 3. Future Enhancements and Roadmap

This section outlines potential future features and improvements for the Forge application.

### 3.1. Core Feature Enhancements
*   **User Profile and Data Storage:**
    *   Create user profile using email as their unique identifier
    *   Capture user preferred name for personalized salutation
    *   Setup authentication for data privacy
    *   Store user data at server side to remove device dependencies
*   **Advanced Biometric Tracking:**
    *   Tracking of additional metrics like body fat percentage (if user provides calipers/dexa scan), muscle mass, and hydration levels.
*   **Workout Customization & Logging:**
    *   Allow users to manually log sets, reps, and weights for each exercise.
    *   Track personal records (PRs) for key lifts.
    *   Option to 'swap' multiple exercises or entire workout days.
*   **Dietary Features:**
    *   Barcode scanner for logging food items.
    *   More extensive database of recipes and food items.
    *   Meal prep suggestions and grocery list generation.
*   **Progress Visualization:**
    *   More advanced charting (e.g., trend lines, comparison charts for different metrics).
    *   Integration of progress photos with visual comparison tools.

### 3.2. AI-Powered Features

*   **Adaptive Training & Periodization:**
    *   Gemini AI to dynamically adjust workout volume, intensity, and exercise selection based on logged performance and recovery status (e.g., deload weeks, progressive overload strategies).
    *   AI-driven injury prevention and rehabilitation protocols based on real-time feedback.
*   **Meal Recommendation Engine V2:**
    *   More granular customization based on dietary restrictions (allergies, intolerances).
    *   Integration with local grocery availability for meal ingredient suggestions.
    *   Dynamic meal adjustments based on workout intensity and recovery needs.
*   **Conversational AI Coach:**
    *   Implement `Live API` for real-time voice interaction with Gemini, allowing users to ask questions about their plan, get motivation, or report issues naturally.
    *   AI chatbot for instant answers to fitness and nutrition queries.

### 3.3. Social & Community Features

*   **Peer-to-Peer Support:**
    *   Connect with friends for shared workouts or progress tracking.
    *   Private messaging and group chat features.
*   **Coach Integration:**
    *   Option for certified human coaches to review and provide feedback on AI-generated plans.

### 3.4. Technical & Infrastructure Improvements

*   **Backend Integration (Optional):**
    *   For multi-device sync and enhanced data security, consider integrating a secure backend service (e.g., Firebase, GCP services). This would change the `localStorageService` significantly.
*   **Advanced PWA Capabilities:**
    *   Background sync for offline data submission.
    *   Web Push Notifications for reminders (e.g., workout time, meal prep).
*   **UI/UX Enhancements:**
    *   More animations and micro-interactions to improve engagement.
    *   Accessibility audit and further improvements.