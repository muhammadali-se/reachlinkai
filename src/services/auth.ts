import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  plan_type: 'free' | 'starter';
  has_submitted_feedback: boolean;
  signup_date: string;
  last_credit_reset: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

// Sign up new user
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign out user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  
  return data;
};

// Update user credits
export const updateUserCredits = async (userId: string, credits: number) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ credits })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Use a credit (decrement by 1)
export const useCredit = async (userId: string): Promise<UserProfile> => {
  // Get current credits
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('User profile not found');
  
  if (profile.credits <= 0) {
    throw new Error('No credits remaining');
  }
  
  // Decrement credits
  const updatedProfile = await updateUserCredits(userId, profile.credits - 1);
  return updatedProfile;
};

// Add feedback reward
export const addFeedbackReward = async (userId: string): Promise<UserProfile> => {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('User profile not found');
  
  if (profile.has_submitted_feedback) {
    throw new Error('Feedback already submitted');
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ 
      credits: profile.credits + 10,
      has_submitted_feedback: true
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Check if monthly reset is needed for starter plan users
export const checkAndResetMonthlyCredits = async (userId: string): Promise<UserProfile> => {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('User profile not found');
  
  // Only reset for starter plan users
  if (profile.plan_type !== 'starter') return profile;
  
  const lastReset = new Date(profile.last_credit_reset);
  const now = new Date();
  const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
  
  // Reset if it's been 30+ days
  if (daysSinceReset >= 30) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        credits: 50, // 50 credits per month for starter plan
        last_credit_reset: now.toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  return profile;
};