import React from "react";
import { cn } from "@/lib/utils";

type GameType = "matka" | "coin";

interface GameTabsProps {
  activeGame: GameType;
  onChangeGame: (game: GameType) => void;
}

const GameTabs: React.FC<GameTabsProps> = ({ activeGame, onChangeGame }) => {
  return (
    <div className="mb-6">
      <div className="inline-flex rounded-lg bg-surface p-1 w-full sm:w-auto">
        <button
          onClick={() => onChangeGame("matka")}
          className={cn(
            "game-tab px-6 py-2 rounded-md font-medium transition-colors",
            activeGame === "matka"
              ? "bg-primary text-white"
              : "text-white/70 hover:text-white/90"
          )}
        >
          Satta Matka
        </button>
        <button
          onClick={() => onChangeGame("coin")}
          className={cn(
            "game-tab px-6 py-2 rounded-md font-medium transition-colors",
            activeGame === "coin"
              ? "bg-primary text-white"
              : "text-white/70 hover:text-white/90"
          )}
        >
          Coin Toss
        </button>
      </div>
    </div>
  );
};

export default GameTabs;
