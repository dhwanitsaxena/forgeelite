import { UserProfile, Gender, SculptingTargetCategory } from '../types';

/**
 * Helper function to calculate suggested targets based on category and current user profile.
 * This logic was extracted from App.tsx to reduce its file size and improve modularity.
 */
export const calculateSuggestedTargets = (profile: UserProfile, category: SculptingTargetCategory) => {
  const { weight, currentComposition, gender, height } = profile;
  const { bodyFatPercentage, waistSize, neckSize, hipSize, chestSize, armSize, bmi } = currentComposition;

  // Initialize newTargets with default values or existing profile targets.
  // Ensure hipSize is included here for female profiles if applicable.
  let newTargets = {
    ...profile.targets,
    hipSize: profile.gender === Gender.FEMALE ? profile.targets.hipSize || hipSize || 95 : 0,
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
    hipSize: gender === Gender.FEMALE ? Number((newTargets.hipSize || 95).toFixed(0)) : 0,
  };
};