import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, X, Star } from 'lucide-react';
import { addFeedbackReward } from '../services/credits';

interface FeedbackModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSuccess }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reward, setReward] = useState<'credits' | 'starter' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.trim().length < 10) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Give fixed 10 credits for feedback
    addFeedbackReward();
    setReward('credits');
    setIsSuccess(true);
    
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
          <p className="text-gray-600">You've received <strong>+10 credits</strong> to continue using ReachLinkAI</p>
          <div className="text-sm text-gray-500 mt-4">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Share Your Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-gray-600">
            Help us improve ReachLinkAI and earn <strong>10 credits</strong> to continue using the app!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How would you rate ReachLinkAI?
            </label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What do you think about ReachLinkAI?
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your honest thoughts, suggestions, or what you'd like to see improved..."
              className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
              required
              minLength={10}
            />
            <div className="text-xs text-gray-500 mt-1">
              {feedback.length}/10 characters minimum
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || feedback.trim().length < 10 || rating === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          💡 Your honest feedback helps us improve ReachLinkAI for everyone!
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;