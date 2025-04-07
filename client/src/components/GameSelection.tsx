import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dice5, Coins } from "lucide-react";

type GameType = "matka" | "coin";

interface GameSelectionProps {
  onSelectGame: (game: GameType) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ onSelectGame }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Select a Game</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Satta Matka Card */}
        <Card 
          className="bg-surface border border-white/5 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
          onClick={() => onSelectGame("matka")}
        >
          <div className="h-40 bg-gradient-to-br from-violet-700 to-purple-500 flex items-center justify-center">
            <Dice5 className="w-20 h-20 text-white/80" />
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Satta Matka
            </h3>
            <p className="text-white/70 text-sm">
              The classic Indian lottery game with multiple markets and bet types. 
              Try your luck with Jodi, Odd/Even, Cross, or Hurf bets.
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">
                Multipliers up to 90x
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 text-xs font-medium">
                Play Now
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Coin Toss Card */}
        <Card 
          className="bg-surface border border-white/5 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
          onClick={() => onSelectGame("coin")}
        >
          <div className="h-40 bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center">
            <Coins className="w-20 h-20 text-white/80" />
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Coin Toss
            </h3>
            <p className="text-white/70 text-sm">
              A simple game of chance. Bet on heads or tails and double your money 
              if you guess correctly.
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">
                1.9x Multiplier
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-medium">
                Play Now
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameSelection;