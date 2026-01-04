import { UserProfile, Gender, SculptingTargetCategory } from '../types';

/**
 * Calculates Body Fat Percentage using the U.S. Navy Method.
 * 
 * Formula:
 * Men: %BF = 86.010 * log10(abdomen - neck) - 70.041 * log10(height) + 36.76
 * Women: %BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
 * 
 * @param params Object containing gender, height(cm), waist(cm), neck(cm), hips(cm)
 * @returns Body Fat Percentage as a number (float)
 */
export const calculateBodyFat = (params: {
  gender: Gender;
  height: number;
  waist: number;
  neck: number;
  hips?: number; // Optional for men, required for women
}): number => {
  const { gender, height, waist, neck, hips } = params;

  // Simple validation to prevent log errors
  if (height <= 0 || waist <= 0 || neck <= 0) return 0;

  if (gender === Gender.MALE) {
    if (waist - neck <= 0) return 0; // Invalid geometry
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    // For women, hips is required
    const hipVal = hips || 95; // Default if missing, though it shouldn't be
    if (waist + hipVal - neck <= 0) return 0;
    return 163.205 * Math.log10(waist + hipVal - neck) - 97.684 * Math.log10(height) - 78.387;
  }
};

/**
 * Helper function to calculate suggested targets based on category and current user profile.
 * This logic was extracted from App.tsx to reduce its file size and improve modularity.
 */
export const calculateSuggestedTargets = (profile: UserProfile, category: SculptingTargetCategory) => {
  const { weight, currentComposition, gender, height } = profile;
  const { bodyFatPercentage, waistSize, neckSize, hipSize } = currentComposition;

  // Initialize newTargets with default values or existing profile targets.
  // Ensure hipSize is included here for female profiles if applicable.
  let newTargets = {
    ...profile.targets,
    hipSize: profile.gender === Gender.FEMALE ? profile.targets.hipSize || hipSize || 95 : 0,
  };

  // Define safe minimum Body Fat % based on gender
  // Men: Essential is 2-5%, Athletes 6-13%. Floor at 10% is safe/athletic.
  // Women: Essential is 10-13%, Athletes 14-20%. Floor at 18% is safe/athletic.
  const safeMinBfp = gender === Gender.FEMALE ? 18 : 10;

  // Calculate minimum safe weight for a healthy BMI (18.5)
  // Formula: Weight = BMI * Height^2
  const heightInMeters = height / 100;
  const minSafeWeight = 18.5 * (heightInMeters * heightInMeters);

  switch (category) {
    case SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS:
      // Reduce weight by 10%, but do not go below safe minimum weight (BMI 18.5) or 30kg absolute min
      newTargets.weight = Math.max(weight * 0.9, minSafeWeight, 30); 
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 5, safeMinBfp); 
      newTargets.waistSize = Math.max(waistSize * 0.9, 50); // 10% reduction, min 50cm
      // Fix: Ensure hipSize is updated for females
      if (gender === Gender.FEMALE && newTargets.hipSize !== undefined) newTargets.hipSize = Math.max(newTargets.hipSize * 0.9, 70);
      break;
    case SculptingTargetCategory.MUSCLE_GAIN_BULKING:
      // If user is underweight, aim for safe weight FIRST, then add muscle bulk.
      // Otherwise, just add 5% to current weight.
      newTargets.weight = Math.max(weight, minSafeWeight) * 1.05; 
      newTargets.bodyFatPercentage = Math.min(bodyFatPercentage + 1, 25); // 1% increase, max 25%
      break;
    case SculptingTargetCategory.BODY_RECOMPOSITION:
      // Reduce weight slightly (2%), but respect safe minimum
      newTargets.weight = Math.max(weight * 0.98, minSafeWeight, 30); 
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 3, safeMinBfp); 
      newTargets.waistSize = Math.max(waistSize * 0.95, 50); // 5% reduction
      // Fix: Ensure hipSize is updated for females
      if (gender === Gender.FEMALE && newTargets.hipSize !== undefined) newTargets.hipSize = Math.max(newTargets.hipSize * 0.98, 70);
      break;
    case SculptingTargetCategory.STRENGTH_BUILDING:
      // If user is underweight, aim for safe weight FIRST, then add strength mass.
      // Otherwise, just add 3% to current weight.
      newTargets.weight = Math.max(weight, minSafeWeight) * 1.03; 
      newTargets.bodyFatPercentage = bodyFatPercentage; // Stable
      break;
    case SculptingTargetCategory.PERFORMANCE_IMPROVEMENT:
      // Reduce weight slightly (1%), but respect safe minimum
      newTargets.weight = Math.max(weight * 0.99, minSafeWeight, 30);
      newTargets.bodyFatPercentage = Math.max(bodyFatPercentage - 2, safeMinBfp); 
      // Other metrics might be kept stable or slightly optimized for performance
      break;
    case SculptingTargetCategory.IMPROVED_HEALTH_MARKERS:
      // Aim for healthy BMI (18.5-24.9) and BFP (Male 15-20%, Female 20-25%)
      // We aim for the middle of healthy BMI: 22
      // Target Weight = 22 * Height^2
      const targetWeightForBmi22 = 22 * (heightInMeters * heightInMeters);
      
      newTargets.weight = Math.max(targetWeightForBmi22, minSafeWeight, 30); // Use explicit calculation relative to height
      newTargets.bodyFatPercentage = gender === Gender.FEMALE 
        ? Math.min(Math.max(bodyFatPercentage - 3, 20), 25) 
        : Math.min(Math.max(bodyFatPercentage - 3, 15), 20); // Adjust towards healthy range
      break;
    default:
      // Fallback to current values or sensible defaults
      newTargets.weight = weight;
      newTargets.bodyFatPercentage = bodyFatPercentage;
      newTargets.waistSize = waistSize;
      // Fix: Ensure hipSize is handled for females
      if (gender === Gender.FEMALE) newTargets.hipSize = hipSize;
      break;
  }

  // Ensure all values are reasonable and formatted
  return {
    weight: Number(newTargets.weight.toFixed(1)),
    bodyFatPercentage: Number(newTargets.bodyFatPercentage.toFixed(1)),
    waistSize: Number(newTargets.waistSize.toFixed(0)),
    // Fix: Ensure hipSize is always present for females if it was before, or defaulted
    hipSize: gender === Gender.FEMALE ? Number((newTargets.hipSize || 95).toFixed(0)) : 0,
  };
};