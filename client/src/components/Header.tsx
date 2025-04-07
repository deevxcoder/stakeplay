import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, User, Sparkles, LogIn, UserPlus, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const Header: React.FC = () => {
  const { user, isLoading, loginAsDemo } = useUser();
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const handleDemoLogin = () => {
    loginAsDemo();
    setDemoInfoOpen(true);
  };

  return (
    <header className="bg-surface shadow-lg border-b border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white mr-3 flex items-center">
            <Sparkles className="h-6 w-6 text-amber-400 mr-2" />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-primary bg-clip-text text-transparent">
              StakePlay
            </span>
          </h1>
          {user && (
            <Badge variant="outline" className="bg-orange-600/20 text-orange-400 border-orange-500/30 text-xs">
              DEMO MODE
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary border-primary/20 hover:bg-primary/10"
                onClick={() => setRegisterDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Button>
              
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-amber-500 to-primary hover:opacity-90"
                onClick={handleDemoLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Try Demo
              </Button>
            </>
          ) : (
            <>
              {/* Virtual Currency Balance */}
              <Popover>
                <PopoverTrigger asChild>
                  <div 
                    className="bg-surface-light rounded-full px-4 py-2 flex items-center border border-white/5 shadow-lg cursor-pointer hover:bg-surface transition-colors"
                    style={{
                      boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)"
                    }}
                  >
                    <Coins className="text-amber-400 mr-2 h-5 w-5" />
                    {isLoading ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <span className="font-bold text-white">
                        {user?.balance.toLocaleString() || 0}
                      </span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Demo Account Balance</h4>
                    <p className="text-sm text-muted-foreground">
                      This is virtual currency for testing purposes only. Create a real account to win real prizes!
                    </p>
                    <Button 
                      className="w-full mt-2"
                      onClick={() => setRegisterDialogOpen(true)}
                    >
                      Create Real Account
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Profile Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="bg-primary hover:bg-primary/80 rounded-full p-2.5 transition shadow-lg"
                    style={{
                      boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="bg-primary/20 p-3 rounded-full mr-3">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">Demo Account</p>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start">
                        <AlertOctagon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          This is a demo account with limited features. Create a real account to access all features and win prizes!
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setRegisterDialogOpen(true)}
                    >
                      Create Real Account
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>
      
      {/* Demo Info Dialog */}
      <Dialog open={demoInfoOpen} onOpenChange={setDemoInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to Demo Mode!</DialogTitle>
            <DialogDescription>
              You're now using a demo account with 1,000 virtual coins to test our betting platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
              <h4 className="font-medium flex items-center text-amber-500">
                <AlertOctagon className="h-5 w-5 mr-2" />
                Demo Account Limitations
              </h4>
              <ul className="text-sm mt-2 space-y-1 ml-7 list-disc">
                <li>All winnings are virtual and cannot be withdrawn</li>
                <li>Limited to 1,000 virtual coins</li>
                <li>Some features are restricted</li>
              </ul>
            </div>
            
            <p className="text-sm text-center">
              Ready to win real prizes? Create a real account!
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDemoInfoOpen(false)}
              className="flex-1"
            >
              Continue with Demo
            </Button>
            <Button 
              onClick={() => {
                setDemoInfoOpen(false);
                setRegisterDialogOpen(true);
              }}
              className="flex-1 bg-gradient-to-r from-amber-500 to-primary"
            >
              Create Real Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Your Account</DialogTitle>
            <DialogDescription>
              Join thousands of players winning real prizes every day!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium flex items-center text-primary">
                <Sparkles className="h-5 w-5 mr-2" />
                Benefits of a Real Account
              </h4>
              <ul className="text-sm mt-2 space-y-1 ml-7 list-disc">
                <li>Win real prizes and withdraw your winnings</li>
                <li>Exclusive bonuses and promotions</li>
                <li>Access to all betting features</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
            
            <p className="text-sm text-center">
              This is just a demo. In a real application, there would be a registration form here.
            </p>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRegisterDialogOpen(false)}
              className="sm:flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={() => setRegisterDialogOpen(false)}
              className="sm:flex-1 bg-gradient-to-r from-amber-500 to-primary"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
