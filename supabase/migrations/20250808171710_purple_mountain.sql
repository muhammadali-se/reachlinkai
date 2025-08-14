/*
  # Add automatic user profile creation trigger

  1. New Functions
    - `handle_new_user()` - Creates user profile when auth user is created
    - `handle_new_user_with_referral()` - Handles referral logic during signup

  2. Triggers
    - `on_auth_user_created` - Automatically creates user profile on signup

  3. Security
    - Functions run with SECURITY DEFINER to bypass RLS during user creation
    - Proper error handling for referral code validation
*/

-- Function to handle new user creation with referral support
CREATE OR REPLACE FUNCTION public.handle_new_user_with_referral()
RETURNS TRIGGER AS $$
DECLARE
  referral_code_input TEXT;
  referrer_id UUID;
  referral_credits INTEGER := 0;
BEGIN
  -- Extract referral code from user metadata if provided
  referral_code_input := NEW.raw_user_meta_data->>'referral_code';
  
  -- If referral code provided, validate and process it
  IF referral_code_input IS NOT NULL AND referral_code_input != '' THEN
    -- Find the referrer
    SELECT id INTO referrer_id 
    FROM public.user_profiles 
    WHERE referral_code = UPPER(referral_code_input);
    
    -- If valid referrer found, set bonus credits
    IF referrer_id IS NOT NULL THEN
      referral_credits := 15;
      
      -- Give referrer bonus credits
      UPDATE public.user_profiles 
      SET 
        credits = credits + 15,
        credits_earned_referrals = credits_earned_referrals + 15
      WHERE id = referrer_id;
      
      -- Record referrer's credit transaction
      INSERT INTO public.credit_transactions (
        user_id, transaction_type, source, amount, description
      ) VALUES (
        referrer_id, 'earned', 'referral', 15, 'Referral bonus for new user signup'
      );
    END IF;
  END IF;
  
  -- Generate unique referral code for new user
  DECLARE
    new_referral_code TEXT;
    code_exists BOOLEAN := TRUE;
  BEGIN
    WHILE code_exists LOOP
      new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
      SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE referral_code = new_referral_code) INTO code_exists;
    END LOOP;
  END;
  
  -- Create user profile with appropriate credits
  INSERT INTO public.user_profiles (
    id, email, credits, plan_type, has_submitted_feedback,
    signup_date, last_credit_reset, credits_earned_signup,
    credits_earned_feedback, credits_earned_referrals,
    credits_subscription, total_credits_used, referral_code, referred_by
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    4 + referral_credits, -- Base 4 credits + referral bonus if applicable
    'free', 
    FALSE,
    NOW(), 
    NOW(), 
    4 + referral_credits, -- Track signup credits including referral bonus
    0, 
    0,
    0, 
    0, 
    new_referral_code,
    referrer_id
  );
  
  -- Record signup credit transaction
  INSERT INTO public.credit_transactions (
    user_id, transaction_type, source, amount, description
  ) VALUES (
    NEW.id, 'earned', 'signup', 4 + referral_credits, 
    CASE 
      WHEN referral_credits > 0 THEN 'Signup bonus (4) + referral bonus (15)'
      ELSE 'Signup bonus'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_referral();