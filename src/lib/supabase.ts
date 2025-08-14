import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          credits: number;
          plan_type: 'free' | 'starter';
          has_submitted_feedback: boolean;
          signup_date: string;
          last_credit_reset: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          credits?: number;
          plan_type?: 'free' | 'starter';
          has_submitted_feedback?: boolean;
          signup_date?: string;
          last_credit_reset?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          credits?: number;
          plan_type?: 'free' | 'starter';
          has_submitted_feedback?: boolean;
          signup_date?: string;
          last_credit_reset?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};