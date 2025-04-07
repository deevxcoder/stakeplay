import React from "react";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins } from "lucide-react";

const Header: React.FC = () => {
  const { user, isLoading } = useUser();

  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white mr-2">
            <span className="text-accent">S</span>take
            <span className="text-primary">Play</span>
          </h1>
          <span className="bg-surface-light text-xs px-2 py-1 rounded-full">
            Demo
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Virtual Currency Balance */}
          <div className="bg-surface-light rounded-full px-4 py-2 flex items-center">
            <Coins className="text-accent mr-2 h-4 w-4" />
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <span className="font-semibold">
                {user?.balance.toLocaleString() || 0}
              </span>
            )}
          </div>

          {/* User Profile Button */}
          <button className="bg-primary hover:bg-primary/80 rounded-full p-2 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-user"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
