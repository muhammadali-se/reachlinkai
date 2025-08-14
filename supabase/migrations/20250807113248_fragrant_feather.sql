/*
  # Update Credit System for Anonymous Usage and Detailed Tracking

  1. New Tables
    - `anonymous_usage` - Track anonymous post generations by device/IP
    - `credit_transactions` - Detailed credit earning/spending history
    - Update `user_profiles` with detailed credit tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and anonymous tracking

  3. Changes
    - Add detailed credit source tracking
    - Add anonymous usage prevention
    - Add referral system support
*/

-- Create anonymous usage tracking table
CREATE TABLE IF NOT EXISTS anonymous_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text,
  ip_address inet,
  user_agent text,
  usage_count integer DEFAULT 1,
  first_used_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create credit transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'reset')),
  source text NOT NULL CHECK (source IN ('signup', 'feedback', 'referral', 'subscription', 'usage', 'monthly_reset')),
  amount integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Update user_profiles table with detailed credit tracking
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'credits_earned_signup') THEN
    ALTER TABLE user_profiles ADD COLUMN credits_earned_signup integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'credits_earned_feedback') THEN
    ALTER TABLE user_profiles ADD COLUMN credits_earned_feedback integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'credits_earned_referrals') THEN
    ALTER TABLE user_profiles ADD COLUMN credits_earned_referrals integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'credits_subscription') THEN
    ALTER TABLE user_profiles ADD COLUMN credits_subscription integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'total_credits_used') THEN
    ALTER TABLE user_profiles ADD COLUMN total_credits_used integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE user_profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'referred_by') THEN
    ALTER TABLE user_profiles ADD COLUMN referred_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous_usage (allow inserts and selects for tracking)
CREATE POLICY "Allow anonymous usage tracking"
  ON anonymous_usage
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can read own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup with referral
CREATE OR REPLACE FUNCTION handle_new_user_with_referral()
RETURNS trigger AS $$
DECLARE
  referrer_id uuid;
  new_referral_code text;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = new_referral_code);
  END LOOP;

  -- Create user profile with signup credits
  INSERT INTO public.user_profiles (
    id, 
    email, 
    credits, 
    credits_earned_signup,
    referral_code,
    referred_by
  ) VALUES (
    NEW.id, 
    NEW.email, 
    4, -- 4 signup credits
    4,
    new_referral_code,
    CASE 
      WHEN NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
        (SELECT id FROM user_profiles WHERE referral_code = NEW.raw_user_meta_data->>'referral_code')
      ELSE NULL
    END
  );

  -- Record signup credit transaction
  INSERT INTO credit_transactions (user_id, transaction_type, source, amount, description)
  VALUES (NEW.id, 'earned', 'signup', 4, 'Signup bonus credits');

  -- Handle referral bonus if referred by someone
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id 
    FROM user_profiles 
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
    
    IF referrer_id IS NOT NULL THEN
      -- Give referrer 15 credits
      UPDATE user_profiles 
      SET 
        credits = credits + 15,
        credits_earned_referrals = credits_earned_referrals + 15
      WHERE id = referrer_id;
      
      -- Record referral transaction for referrer
      INSERT INTO credit_transactions (user_id, transaction_type, source, amount, description)
      VALUES (referrer_id, 'earned', 'referral', 15, 'Referral bonus for new user signup');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_with_referral();