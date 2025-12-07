export interface UserModel {
  emotionalState: 'neutral' | 'confused' | 'focused' | 'rushed' | 'frustrated' | 'engaged';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'low' | 'medium' | 'high';
  preferredPace: 'slow' | 'normal' | 'fast';
  usagePatterns: Record<string, number>;
  lastUpdated: number;
}

export const userModel: UserModel = {
  emotionalState: 'neutral',
  skillLevel: 'intermediate',
  riskTolerance: 'medium',
  preferredPace: 'normal',
  usagePatterns: {},
  lastUpdated: Date.now(),
};

export function updateUsagePattern(key: string) {
  userModel.usagePatterns[key] = (userModel.usagePatterns[key] || 0) + 1;
  userModel.lastUpdated = Date.now();
}

