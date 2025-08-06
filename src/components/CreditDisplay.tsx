import React from 'react';
import { Zap, Crown, Mail, MessageSquare, Users, Gift } from 'lucide-react';
import { CreditState } from '../services/credits';

interface CreditDisplayProps {
  creditState: CreditState;
  onEmailSubmit: () => void;
  onFeedbackSubmit: () => void;
  onReferralSubmit?: () => void;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  creditState, 
  onEmailSubmit, 
  onFeedbackSubmit,
  onReferralSubmit
}) => {
  const getPlanIcon = () => {
    if (creditState.plan === 'starter') {
      return <Crown className="w-4 h-4 text-yellow-500" />;
    }
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  const getPlanName = () => {
    if (creditState.plan === 'starter') {
      return creditState.subscriptionActive ? 'Starter Plan ($9/month)' : 'Starter Plan (Earned)';
    }
    return 'Free Plan';
  };

  const getPlanColor = () => {
    if (creditState.plan === 'starter') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getTotalPossibleCredits = () => {
    let total = 1; // First visit
    if (!creditState.email) total += 4;
    if (!creditState.hasSubmittedFeedback) total += 10;
    total += 15; // At least one referral possible
    return total;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPlanIcon()}
          <span className="font-semibold text-gray-900">{getPlanName()}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor()}`}>
          {creditState.remainingCredits} credits left
        </div>
      </div>

      {/* Free Credits Promotion */}
      {creditState.plan === 'free' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">🎁 Earn Up to 30 Free Credits</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            That's one full month of Starter Plan (a $9 value) — no subscription required!
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">👋 First app visit</span>
              <span className="font-medium text-green-600">+1 credit ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✉️ Submit email</span>
              <span className={`font-medium ${creditState.email ? 'text-green-600' : 'text-blue-600'}`}>
                +4 credits {creditState.email ? '✓' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💬 Give honest feedback</span>
              <span className={`font-medium ${creditState.hasSubmittedFeedback ? 'text-green-600' : 'text-blue-600'}`}>
                +10 credits {creditState.hasSubmittedFeedback ? '✓' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🤝 Refer a friend</span>
              <span className="font-medium text-blue-600">+15 credits each</span>
            </div>
          </div>
        </div>
      )}

      {creditState.remainingCredits === 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            You've used all your credits. Get more to continue:
          </div>
          
          <div className="grid gap-3">
            {!creditState.email && (
              <button
                onClick={onEmailSubmit}
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-blue-900">Submit Email</div>
                    <div className="text-sm text-blue-600">Get 4 credits instantly</div>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            )}

            {!creditState.hasSubmittedFeedback && (
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

          {creditState.email && creditState.hasSubmittedFeedback && (
            <div className="text-center py-4 border-t border-gray-100 mt-4">
              <div className="text-gray-900 font-semibold mb-2">🚀 Ready for Starter Plan?</div>
              <div className="text-sm text-gray-600 mb-3">
                Get 30 post generations/optimizations per month
              </div>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Upgrade to Starter - $9/month
              </button>
            </div>
          )}
        </div>
      )}

      {creditState.plan === 'starter' && creditState.planExpiry && (
        <div className="mt-3 text-xs text-gray-500">
          {creditState.subscriptionActive ? 'Next billing' : 'Plan expires'}: {new Date(creditState.planExpiry).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};