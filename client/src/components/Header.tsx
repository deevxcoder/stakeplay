import React from "react";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, User, Sparkles } from "lucide-react";

const Header: React.FC = () => {
  const { user, isLoading } = useUser();

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
          <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-semibold">
            Demo
          </span>
        </div>

        <div className="flex items-center space-x-4">
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

          {/* User Profile Button */}
          <button 
            className="bg-primary hover:bg-primary/80 rounded-full p-2.5 transition shadow-lg"
            style={{
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)"
            }}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
