import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

const DemoBanner: React.FC = () => {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);

  // Only show banner for demo users
  useEffect(() => {
    if (user && localStorage.getItem('demoMode') === 'true') {
      // Get dismiss count from localStorage
      const count = parseInt(localStorage.getItem('demoBannerDismissCount') || '0');
      setDismissCount(count);
      
      // Show banner after 10 seconds
      const timer = setTimeout(() => {
        // Only show if dismissed less than 3 times
        if (count < 3) {
          setIsVisible(true);
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Increment dismiss count
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem('demoBannerDismissCount', newCount.toString());
  };

  if (!isVisible || !user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-rose-600 p-3 shadow-lg z-50 animate-slideUp">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center text-white">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">
            You're in <span className="font-bold">Demo Mode</span> with virtual coins only. 
            <span className="hidden sm:inline"> Create a real account to win real prizes!</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            size="sm" 
            className="bg-white text-rose-600 hover:bg-white/90"
            onClick={() => {
              // This would open the register dialog in a real app
              // For our demo, we'll just close the banner
              handleDismiss();
            }}
          >
            Create Account
          </Button>
          <button 
            className="text-white/80 hover:text-white"
            onClick={handleDismiss}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;