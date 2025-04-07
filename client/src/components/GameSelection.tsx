import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dice5, Coins, Trophy, Users, ArrowRightCircle } from "lucide-react";

type GameType = "matka" | "coin";

interface GameSelectionProps {
  onSelectGame: (game: GameType) => void;
}

const GameSelection: React.FC<GameSelectionProps> = ({ onSelectGame }) => {
  return (
    <div className="mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">
          Choose Your Game
        </h2>
        <p className="text-white/70 mt-2 max-w-xl mx-auto">
          Select one of our popular betting games below and try your luck with virtual coins
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Satta Matka Card */}
        <Card 
          className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 duration-300"
          style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}
          onClick={() => onSelectGame("matka")}
        >
          <div className="h-40 bg-gradient-to-br from-violet-700 to-purple-500 flex items-center justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10"></div>
            <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 rounded-full bg-white/5"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <Dice5 className="w-20 h-20 text-white drop-shadow-lg" />
              <div className="mt-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-xs font-bold text-white">MULTIPLE MARKETS</span>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Satta Matka
            </h3>
            <p className="text-white/80 text-sm mb-5">
              The classic Indian lottery game with multiple markets and bet types. 
              Try your luck with Jodi, Odd/Even, Cross, or Hurf bets.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="text-violet-400 mr-2">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Multiplier</div>
                  <div className="font-medium text-sm">Up to 90x</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="text-violet-400 mr-2">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Active Players</div>
                  <div className="font-medium text-sm">2.5K+</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <div className="flex items-center text-violet-400 font-medium">
                Play Now
                <ArrowRightCircle className="h-4 w-4 ml-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coin Toss Card */}
        <Card 
          className="bg-surface border border-white/5 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 duration-300"
          style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}
          onClick={() => onSelectGame("coin")}
        >
          <div className="h-40 bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10"></div>
            <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 rounded-full bg-white/5"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <Coins className="w-20 h-20 text-white drop-shadow-lg" />
              <div className="mt-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-xs font-bold text-white">INSTANT RESULTS</span>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Coin Toss
            </h3>
            <p className="text-white/80 text-sm mb-5">
              A simple game of chance. Bet on heads or tails and double your money 
              if you guess correctly. Perfect for beginners!
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="text-amber-400 mr-2">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Multiplier</div>
                  <div className="font-medium text-sm">1.9x</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center">
                <div className="text-amber-400 mr-2">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-white/50">Active Players</div>
                  <div className="font-medium text-sm">1.2K+</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <div className="flex items-center text-amber-400 font-medium">
                Play Now
                <ArrowRightCircle className="h-4 w-4 ml-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameSelection;