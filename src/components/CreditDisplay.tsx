import React from 'react';
import { Zap, Crown, MessageSquare, Users, Gift } from 'lucide-react';
import type { UserProfile } from '../services/auth';

interface CreditDisplayProps {
  profile: UserProfile;
  onFeedbackSubmit: () => void;
  onReferralSubmit?: () => void;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  profile, 
  onFeedbackSubmit,
  onReferralSubmit
}) => {
  const getPlanIcon = () => {
    if (profile.plan_type === 'starter') {
      return <Crown className="w-4 h-4 text-yellow-500" />;
    }
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  const getPlanName = () => {
    if (profile.plan_type === 'starter') {
      return 'Starter Plan ($9/month)';
    }
    return 'Free Plan';
  };

  const getPlanColor = () => {
    if (profile.plan_type === 'starter') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPlanIcon()}
          <span className="font-semibold text-gray-900">{getPlanName()}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor()}`}>
          {profile.credits} credits left
        </div>
      </div>

      {/* Free Credits Promotion */}
      {profile.plan_type === 'free' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">🎁 Earn More Free Credits</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Get up to 30 free credits — that's one full month of Starter Plan (a $9 value)!
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">👋 Account created</span>
              <span className="font-medium text-green-600">+1 credit ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💬 Give honest feedback</span>
              <span className={`font-medium ${profile.has_submitted_feedback ? 'text-green-600' : 'text-blue-600'}`}>
                +10 credits {profile.has_submitted_feedback ? '✓' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🤝 Refer a friend</span>
              <span className="font-medium text-blue-600">+15 credits each</span>
            </div>
          </div>
        </div>
      )}

      {profile.credits === 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            You've used all your credits. Get more to continue:
          </div>
          
          <div className="grid gap-3">
            {!profile.has_submitted_feedback && (
              <button
                onClick={onFeedbackSubmit}
                className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-purple-900">Share Feedback</div>
                    <div className="text-sm text-purple-600">Get 10 credits</div>
                  </div>
                </div>
                <div className="text-purple-600 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            )}

            {onReferralSubmit && (
              <button
                onClick={onReferralSubmit}
                className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-green-900">Refer Friends</div>
                    <div className="text-sm text-green-600">Get 15 credits per referral</div>
                  </div>
                </div>
                <div className="text-green-600 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            )}
          </div>

          {profile.has_submitted_feedback && (
            <div className="text-center py-4 border-t border-gray-100 mt-4">
              <div className="text-gray-900 font-semibold mb-2">🚀 Ready for Starter Plan?</div>
              <div className="text-sm text-gray-600 mb-3">
                Get 50 post generations/optimizations per month
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Upgrade to Starter - $9/month
              </button>
            </div>
          )}
        </div>
      )}

      {profile.plan_type === 'starter' && (
        <div className="mt-3 text-xs text-gray-500">
          Credits reset monthly • Next reset: {new Date(new Date(profile.last_credit_reset).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};