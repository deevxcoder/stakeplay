import React, { useState, useEffect } from 'react';
import { AlertCircle, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CreateAccountCTAProps = {
  triggerType?: 'bet' | 'win' | 'loss' | 'low-balance';
};

// This component shows a CTA to create a real account during gameplay
const CreateAccountCTA: React.FC<CreateAccountCTAProps> = ({ triggerType = 'win' }) => {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Determine if the CTA should be shown based on different game events
  useEffect(() => {
    if (user && localStorage.getItem('demoMode') === 'true') {
      // Get the count of CTAs shown
      const ctaCount = parseInt(localStorage.getItem('demoCtaCount') || '0');
      
      // Show CTA only occasionally to avoid annoyance
      if (triggerType === 'win' && ctaCount < 3) {
        // Show dialog after a 1 second delay for win celebrations
        const timer = setTimeout(() => {
          setIsDialogOpen(true);
          localStorage.setItem('demoCtaCount', (ctaCount + 1).toString());
        }, 1000);
        
        return () => clearTimeout(timer);
      } 
      else if (triggerType === 'low-balance' && user.balance < 300 && ctaCount < 5) {
        // Show dialog if balance is low
        setIsDialogOpen(true);
        localStorage.setItem('demoCtaCount', (ctaCount + 1).toString());
      }
    }
  }, [user, triggerType]);

  if (!user) return null;

  const getDialogContent = () => {
    switch (triggerType) {
      case 'win':
        return {
          title: "Congratulations on Your Win!",
          description: "Imagine if these were real winnings! Create a real account to start winning actual prizes.",
          icon: <Gift className="h-12 w-12 text-amber-500" />,
          details: "With a real account, your winnings can be withdrawn and you'll get access to exclusive bonuses and promotions!"
        };
      case 'low-balance':
        return {
          title: "Running Low on Demo Coins?",
          description: "Create a real account to get a generous welcome bonus and start your winning journey!",
          icon: <AlertCircle className="h-12 w-12 text-amber-500" />,
          details: "Real accounts come with generous deposit bonuses and promotions to maximize your winnings!"
        };
      default:
        return {
          title: "Take Your Gaming to the Next Level!",
          description: "Create a real account to unlock all features and start winning real prizes.",
          icon: <Gift className="h-12 w-12 text-amber-500" />,
          details: "Real accounts offer exclusive bonuses, promotions, and the ability to withdraw your winnings!"
        };
    }
  };

  const content = getDialogContent();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-amber-500/10 p-4 rounded-full mb-4">
            {content.icon}
          </div>
          <DialogTitle className="text-xl text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-center">
              {content.details}
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            className="sm:w-auto"
          >
            Continue in Demo
          </Button>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            className="sm:w-auto bg-gradient-to-r from-amber-500 to-primary group"
          >
            Create Real Account
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountCTA;