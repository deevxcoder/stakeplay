import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, Sparkles, AlertOctagon, UserPlus, History, 
  Settings, LogOut, ChevronDown, UserCircle, Wallet, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation, Link } from "wouter";

const Header: React.FC = () => {
  const { user, isLoading, loginAsDemo, logoutMutation } = useAuth();
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleDemoLogin = () => {
    loginAsDemo();
    setDemoInfoOpen(true);
  };
  
  const handleLogout = () => {
    if (user && window.confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };
  
  const goToAuth = () => {
    navigate("/auth");
  };

  return (
    <header className="bg-surface shadow-lg border-b border-white/10 sticky top-0 z-10">
      <div className="w-full px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mr-2 flex items-center">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mr-1 sm:mr-2" />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-primary bg-clip-text text-transparent">
              StakePlay
            </span>
          </h1>
        </div>

        {/* User Actions and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Badge */}
          {!user ? (
            <Badge 
              variant="outline" 
              className="bg-amber-600/20 text-amber-400 border-amber-500/30 text-xs cursor-pointer hover:bg-amber-600/30 transition-colors"
              onClick={handleDemoLogin}
            >
              DEMO
            </Badge>
          ) : (
            <>
              {/* Demo Badge when logged in */}
              <Badge variant="outline" className="bg-orange-600/20 text-orange-400 border-orange-500/30 text-xs hidden sm:flex">
                DEMO MODE
              </Badge>
            
              {/* Virtual Currency Balance */}
              <div 
                className="bg-surface-light rounded-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center border border-white/5 shadow-lg"
                style={{
                  boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)"
                }}
              >
                <Coins className="text-amber-400 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {isLoading ? (
                  <Skeleton className="h-5 w-14 sm:h-6 sm:w-16" />
                ) : (
                  <span className="font-bold text-white text-sm sm:text-base">
                    {user?.balance.toLocaleString() || 0}
                  </span>
                )}
              </div>
            </>
          )}

          {/* User Avatar - Different states based on login status */}
          {!user ? (
            <Button 
              className="bg-surface-light hover:bg-surface-light/80 p-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/10"
              onClick={goToAuth}
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 h-8 sm:h-10 rounded-full border border-primary/20 flex items-center px-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary-foreground text-primary">
                      <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground/70 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.username} {user.isAdmin && <span className="text-primary">(Admin)</span>}
                </div>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/wallet")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/wallet?tab=bets")}>
                  <History className="mr-2 h-4 w-4" />
                  <span>Betting History</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Demo Info Dialog */}
      <Dialog open={demoInfoOpen} onOpenChange={setDemoInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Welcome to Demo Mode!</DialogTitle>
            <DialogDescription>
              You're now using a demo account with 10,000 virtual coins to test our betting platform.
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
                <li>Limited to 10,000 virtual coins</li>
                <li>Some features are restricted</li>
              </ul>
            </div>
            
            <p className="text-sm text-center">
              Ready to play with a permanent account? Register now!
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
                goToAuth();
              }}
              className="flex-1 bg-gradient-to-r from-amber-500 to-primary"
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
