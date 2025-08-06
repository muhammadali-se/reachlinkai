import React, { useState } from 'react';
import { Sparkles, RefreshCw, Info, Lightbulb, Edit3 } from 'lucide-react';
import { Mode, FormData, Tone } from '../types';
import { shouldUseMockData } from '../services/api';
import { CreditState } from '../services/credits';
import { CreditDisplay } from './CreditDisplay';

interface HomeProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  creditState: CreditState;
  onEmailSubmit: () => void;
  onFeedbackSubmit: () => void;
}

const Home: React.FC<HomeProps> = ({ 
  onSubmit, 
  isLoading, 
  creditState, 
  onEmailSubmit, 
  onFeedbackSubmit 
}) => {
  const [mode, setMode] = useState<Mode>('optimize');
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<Tone>('neutral');
  const isUsingMockData = shouldUseMockData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSubmit({
      mode,
      tone,
      input: input.trim()
    });
  };

  const getActionIcon = () => {
    if (mode === 'generate') {
      return <Lightbulb className="w-4 h-4" />;
    }
    return <Edit3 className="w-4 h-4" />;
  };

  const getInputPlaceholder = () => {
    if (mode === 'generate') {
      return "e.g. AI career tips, remote work challenges, startup lessons...";
    }
    return "e.g. I left my job in tech to go solo…";
  };

  const getInputLabel = () => {
    if (mode === 'generate') {
      return "What topics do you want to write about?";
    }
    return "Paste your LinkedIn post";
  };

  const getButtonText = () => {
    return mode === 'generate' ? 'Generate Posts' : 'Improve Post';
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ReachLinkAI</h1>
          <p className="text-gray-600 text-lg">AI LinkedIn Growth Tool — Reach More. Engage Better. Grow Faster.</p>
          <div className="mt-4 inline-flex items-center space-x-4 text-sm text-gray-500">
            <span>✨ AI LinkedIn Post Optimizer</span>
            <span>•</span>
            <span>🚀 LinkedIn Reach Gainer</span>
            <span>•</span>
            <span>🎁 $9 Free Value</span>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isUsingMockData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Demo Mode</h3>
                <p className="text-sm text-amber-700">
                  You're using mock data since no OpenAI API key is configured. 
                  The app will show sample results to demonstrate functionality.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Credit Display */}
          <CreditDisplay 
            creditState={creditState}
            onEmailSubmit={onEmailSubmit}
            onFeedbackSubmit={onFeedbackSubmit}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What would you like to do?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('optimize')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                    mode === 'optimize'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Edit3 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Optimize</div>
                    <div className="text-sm opacity-75">Improve existing</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('generate')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                    mode === 'generate'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Generate</div>
                    <div className="text-sm opacity-75">Create new posts</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose your tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setTone('neutral')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    tone === 'neutral'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm">Neutral</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTone('viral')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    tone === 'viral'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm">Viral</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTone('professional')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    tone === 'professional'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm">Professional</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTone('concise')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    tone === 'concise'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm">Concise</div>
                </button>
              </div>
            </div>

            {/* Input Field */}
            <div>
              <label htmlFor="input" className="block text-sm font-semibold text-gray-700 mb-2">
                {getInputLabel()}
              </label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getInputPlaceholder()}
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim() || creditState.remainingCredits <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{mode === 'generate' ? 'Generating...' : 'Improving...'}</span>
                </>
              ) : (
                <>
                  {getActionIcon()}
                  <span>{getButtonText()}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          @ReachLinkAI 2025 All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default Home;