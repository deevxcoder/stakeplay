import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, Sparkles, AlertOctagon, UserPlus, History, 
  Settings, LogOut, ChevronDown, UserCircle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Header: React.FC = () => {
  const { user, isLoading, loginAsDemo, logout } = useUser();
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const handleDemoLogin = () => {
    loginAsDemo();
    setDemoInfoOpen(true);
  };
  
  const handleLogout = () => {
    if (user && window.confirm("Are you sure you want to log out?")) {
      logout();
    }
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
          {/* Demo Mode Badge - Always visible but clickable when not logged in */}
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
              {/* Virtual Currency Balance */}
              <div 
                className="bg-surface-light rounded-full px-4 py-2 flex items-center border border-white/5 shadow-lg"
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
            </>
          )}

          {/* User Avatar - Different states based on login status */}
          {!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-surface-light hover:bg-surface-light/80 p-0 h-10 w-10 rounded-full border border-white/10"
                >
                  <UserPlus className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDemoLogin} className="cursor-pointer">
                  <Coins className="mr-2 h-4 w-4 text-amber-400" />
                  <span>Login as Demo User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRegisterDialogOpen(true)} className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 p-0 h-10 px-3 rounded-full border border-primary/20 flex items-center gap-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary-foreground text-primary">
                      <UserCircle className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium ml-1 hidden sm:inline-block">{user.username}</span>
                  <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <History className="mr-2 h-4 w-4" />
                  <span>Betting History</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
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
