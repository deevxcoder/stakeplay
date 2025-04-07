import React from "react";
import { cn } from "@/lib/utils";
import { Dice5, Coins } from "lucide-react";

type GameType = "matka" | "coin";

interface GameTabsProps {
  activeGame: GameType;
  onChangeGame: (game: GameType) => void;
}

const GameTabs: React.FC<GameTabsProps> = ({ activeGame, onChangeGame }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <button
          onClick={() => onChangeGame("matka")}
          className={cn(
            "game-tab px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center w-full sm:w-auto",
            activeGame === "matka"
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
              : "bg-surface text-white/70 hover:text-white border border-white/5 hover:border-white/10",
            "transform hover:scale-[1.03] active:scale-[0.98]"
          )}
          style={{
            boxShadow: activeGame === "matka" ? "0 0 15px rgba(16, 185, 129, 0.2)" : ""
          }}
        >
          <Dice5 className={cn(
            "mr-2 h-5 w-5",
            activeGame === "matka" ? "text-white" : "text-accent"
          )} />
          Satta Matka
        </button>
        <button
          onClick={() => onChangeGame("coin")}
          className={cn(
            "game-tab px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center w-full sm:w-auto",
            activeGame === "coin"
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
              : "bg-surface text-white/70 hover:text-white border border-white/5 hover:border-white/10",
            "transform hover:scale-[1.03] active:scale-[0.98]"
          )}
          style={{
            boxShadow: activeGame === "coin" ? "0 0 15px rgba(16, 185, 129, 0.2)" : ""
          }}
        >
          <Coins className={cn(
            "mr-2 h-5 w-5",
            activeGame === "coin" ? "text-white" : "text-accent"
          )} />
          Coin Toss
        </button>
      </div>
    </div>
  );
};

export default GameTabs;
