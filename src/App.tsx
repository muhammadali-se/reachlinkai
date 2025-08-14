import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCredit } from './services/auth';
import Home from './components/Home';
import Results from './components/Results';
import AuthModal from './components/AuthModal';
import FeedbackModal from './components/FeedbackModal';
import { FormData } from './types';
import { fetchResults } from './services/api';

type Screen = 'home' | 'results';

function App() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [results, setResults] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<'generate' | 'optimize'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Show auth modal if user is not authenticated
  const requireAuth = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!requireAuth() || !user || !profile) return;

    // Check if user has credits
    if (profile.credits <= 0) {
      setError('No credits remaining. Please get more credits to continue.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentMode(data.mode);
    
    try {
      // Use a credit first
      await useCredit(user.id);
      
      // Refresh profile to update credits
      await refreshProfile();
      
      // Fetch results
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Profile will be automatically refreshed by useAuth hook
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackModal(false);
    refreshProfile(); // Refresh to update credits
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!user || !profile) {
    return (
      <>
        <Home 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
          profile={null}
          onAuthRequired={() => setShowAuthModal(true)}
          onFeedbackSubmit={() => setShowFeedbackModal(true)}
        />
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
        
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
      </>
    );
  }

  return (
    <div className="relative">
      {currentScreen === 'home' ? (
        <Home 
          onSubmit={handleFormSubmit} 
          isLoading={isLoading} 
          profile={profile}
          onAuthRequired={() => setShowAuthModal(true)}
          onFeedbackSubmit={() => setShowFeedbackModal(true)}
        />
      ) : (
        <Results results={results} onNewQuery={handleNewQuery} mode={currentMode} />
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && user && (
        <FeedbackModal
          userId={user.id}
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