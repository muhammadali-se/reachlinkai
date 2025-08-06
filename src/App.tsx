import React, { useState } from 'react';
import { useEffect } from 'react';
import Home from './components/Home';
import Results from './components/Results';
import EmailSubmission from './components/EmailSubmission';
import FeedbackModal from './components/FeedbackModal';
import { FormData } from './types';
import { fetchResults } from './services/api';
import { getCreditState, useCredit } from './services/credits';

type Screen = 'home' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [results, setResults] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<'generate' | 'optimize'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditState, setCreditState] = useState(getCreditState());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Refresh credit state on app load
    setCreditState(getCreditState());
  }, []);

  const refreshCreditState = () => {
    setCreditState(getCreditState());
  };

  const handleFormSubmit = async (data: FormData) => {
    // Check if user has credits
    if (creditState.remainingCredits <= 0) {
      setError('No credits remaining. Please get more credits to continue.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Use a credit
    const creditUsed = useCredit();
    if (!creditUsed) {
      setError('Unable to use credit. Please try again.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Refresh credit state
    refreshCreditState();

    setIsLoading(true);
    setError(null);
    setCurrentMode(data.mode);
    
    try {
      const apiResults = await fetchResults(data);
      
      if (apiResults.length === 0) {
        throw new Error(`No ${data.mode === 'generate' ? 'content generated' : 'improved versions generated'}. Please try again with different input.`);
      }
      
      setResults(apiResults);
      setCurrentScreen('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      // Show error for 5 seconds then clear
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuery = () => {
    setCurrentScreen('home');
    setResults([]);
    setError(null);
  };

  const handleEmailSuccess = () => {
    refreshCreditState();
  };

  const handleFeedbackSuccess = () => {
    refreshCreditState();
  };

  return (
    <div className="relative">
      {currentScreen === 'home' ? (
        <Home 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
          creditState={creditState}
          onEmailSubmit={() => setShowEmailModal(true)}
          onFeedbackSubmit={() => setShowFeedbackModal(true)}
        />
      ) : (
        <Results results={results} onNewQuery={handleNewQuery} mode={currentMode} />
      )}
      
      {/* Email Submission Modal */}
      {showEmailModal && (
        <EmailSubmission
          onClose={() => setShowEmailModal(false)}
          onSuccess={handleEmailSuccess}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg max-w-md mx-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;