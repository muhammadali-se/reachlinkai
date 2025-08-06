// Credit management service
export interface CreditState {
  remainingCredits: number;
  hasUsedFreeTrial: boolean;
  email?: string;
  hasSubmittedFeedback: boolean;
  referralCount: number;
  plan?: 'free' | 'starter';
  planExpiry?: number;
  subscriptionActive?: boolean;
}

const STORAGE_KEY = 'reachlinkai_credits';

export const getInitialCreditState = (): CreditState => {
  return {
    remainingCredits: 1, // First app visit credit
    hasUsedFreeTrial: false,
    hasSubmittedFeedback: false,
    referralCount: 0,
    plan: 'free'
  };
};

export const getCreditState = (): CreditState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getInitialCreditState();
    
    const parsed = JSON.parse(stored);
    
    // Check if starter plan has expired
    if (parsed.plan === 'starter' && parsed.planExpiry && Date.now() > parsed.planExpiry && !parsed.subscriptionActive) {
      parsed.plan = 'free';
      parsed.remainingCredits = 0;
      saveCreditState(parsed);
    }
    
    return parsed;
  } catch {
    return getInitialCreditState();
  }
};

export const saveCreditState = (state: CreditState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useCredit = (): boolean => {
  const state = getCreditState();
  
  if (state.remainingCredits <= 0) {
    return false; // No credits available
  }
  
  state.remainingCredits -= 1;
  if (!state.hasUsedFreeTrial) {
    state.hasUsedFreeTrial = true;
  }
  
  saveCreditState(state);
  return true;
};

export const addEmailCredits = (email: string): void => {
  const state = getCreditState();
  
  if (state.email) {
    return; // Already submitted email
  }
  
  state.email = email;
  state.remainingCredits += 4; // Updated to +4 credits
  saveCreditState(state);
};

export const addFeedbackReward = (): void => {
  const state = getCreditState();
  
  if (state.hasSubmittedFeedback) {
    return; // Already submitted feedback
  }
  
  state.hasSubmittedFeedback = true;
  state.remainingCredits += 10; // Fixed +10 credits for feedback
  saveCreditState(state);
};

export const addReferralReward = (): void => {
  const state = getCreditState();
  state.referralCount += 1;
  state.remainingCredits += 15; // +15 credits per referral
  saveCreditState(state);
};

export const activateStarterPlan = (isSubscription: boolean = false): void => {
  const state = getCreditState();
  state.plan = 'starter';
  state.subscriptionActive = isSubscription;
  
  if (isSubscription) {
    // Monthly subscription - reset credits to 30 each month
    state.remainingCredits = 30;
    state.planExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
  } else {
    // One-time earned starter plan (if they earn 30 credits)
    state.remainingCredits = Math.max(state.remainingCredits, 30);
  }
  
  saveCreditState(state);
};

export const getTotalEarnableCredits = (): number => {
  const state = getCreditState();
  let total = 0;
  
  // First visit (already given)
  if (state.hasUsedFreeTrial) total += 1;
  
  // Email submission
  if (!state.email) total += 4;
  
  // Feedback
  if (!state.hasSubmittedFeedback) total += 10;
  
  // Referrals (assume max 1 for display purposes)
  total += 15;
  
  return total;
};

export const resetCredits = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};