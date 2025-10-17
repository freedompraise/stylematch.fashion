// src/lib/featureFlags.ts
// A simple feature flag system for silent rollouts

export interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  userGroups?: string[]; // Optional user groups that get the feature
}

export interface FeatureFlags {
  MULTI_IMAGE_UPLOAD: FeatureFlag;
  // Add more feature flags here as needed
}

// Default feature flags configuration
export const FEATURE_FLAGS: FeatureFlags = {
  MULTI_IMAGE_UPLOAD: {
    enabled: true,
    rolloutPercentage: 100, // Start with 100% to enable for all users
    userGroups: ['early_adopters', 'power_users']
  }
};

// Check if a feature is enabled for a specific user
export function isFeatureEnabled(
  featureName: keyof FeatureFlags,
  userId?: string
): boolean {
  const feature = FEATURE_FLAGS[featureName];
  
  // If feature is not enabled globally, return false
  if (!feature.enabled) return false;
  
  // If rollout is 100%, enable for everyone
  if (feature.rolloutPercentage === 100) return true;
  
  // If no user ID is provided, use a random number for anonymous users
  if (!userId) {
    return Math.random() * 100 < feature.rolloutPercentage;
  }
  
  // Deterministic hashing for consistent user experience
  const hash = hashString(userId);
  const userPercentile = hash % 100;
  
  return userPercentile < feature.rolloutPercentage;
}

// Simple string hash function for deterministic user assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get max allowed images based on feature flag
export function getMaxAllowedImages(userId?: string): number {
  // Default to 1 image if feature is disabled
  if (!isFeatureEnabled('MULTI_IMAGE_UPLOAD', userId)) {
    return 1;
  }
  
  // Allow 3 images if feature is enabled
  return 3;
}
