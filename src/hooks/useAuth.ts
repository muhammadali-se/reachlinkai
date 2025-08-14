import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser, getUserProfile, checkAndResetMonthlyCredits } from '../services/auth';
import type { AuthState, UserProfile } from '../services/auth';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  const refreshProfile = async (user: User) => {
    try {
      // Check for monthly reset first
      let profile = await checkAndResetMonthlyCredits(user.id);
      if (!profile) {
        profile = await getUserProfile(user.id);
      }
      
      setAuthState(prev => ({
        ...prev,
        profile,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAuthState(prev => ({
        ...prev,
        profile: null,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          setAuthState(prev => ({ ...prev, user }));
          await refreshProfile(user);
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          profile: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthState(prev => ({ ...prev, user: session.user }));
          await refreshProfile(session.user);
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (authState.user) {
      await refreshProfile(authState.user);
    }
  };

  return {
    ...authState,
    refreshProfile: refreshUserProfile,
  };
};