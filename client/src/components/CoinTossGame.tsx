import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, History, Trophy, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CoinTossResult = {
  result: "heads" | "tails";
  isWin: boolean;
  payout: number;
  newBalance: number;
};

const CoinTossGame: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [betAmount, setBetAmount] = useState<number>(100);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<CoinTossResult | null>(null);

  // Define game history type
  interface GameHistoryItem {
    id: number;
    gameType: string;
    result: string;
    timestamp: string;
  }

  // Query for game history
  const { data: gameHistory, isLoading: isHistoryLoading } = useQuery<GameHistoryItem[]>({
    queryKey: ['/api/games/coin/history'],
  });

  // Calculate stats
  const calculateStats = () => {
    if (!gameHistory || gameHistory.length === 0) {
      return {
        headsStreak: 0,
        tailsStreak: 0,
        winRate: 0,
        bestWin: 0
      };
    }

    let headsStreak = 0;
    let tailsStreak = 0;
    let currentHeadsStreak = 0;
    let currentTailsStreak = 0;
    
    gameHistory.forEach((history) => {
      if (history.result === "heads") {
        currentHeadsStreak++;
        currentTailsStreak = 0;
      } else {
        currentTailsStreak++;
        currentHeadsStreak = 0;
      }
      
      headsStreak = Math.max(headsStreak, currentHeadsStreak);
      tailsStreak = Math.max(tailsStreak, currentTailsStreak);
    });

    // Demo stats for now
    return {
      headsStreak: headsStreak || 3,
      tailsStreak: tailsStreak || 2,
      winRate: 58,
      bestWin: 1900
    };
  };

  const stats = calculateStats();

  // Calculate potential win
  const calculatePotentialWin = (): number => {
    return Math.floor(betAmount * 1.9);
  };

  // Play game mutation
  const { mutate: playGame, isPending } = useMutation({
    mutationFn: async (choice: "heads" | "tails") => {
      const res = await apiRequest('POST', '/api/games/coin/play', {
        choice,
        betAmount
      });
      const data = await res.json();
      return data as CoinTossResult;
    },
    onSuccess: (data) => {
      setIsFlipping(true);
      setTimeout(() => {
        setGameResult(data);
        // Update user data via query invalidation
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        setIsFlipping(false);
        setShowResults(true);
        queryClient.invalidateQueries({ queryKey: ['/api/games/coin/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/bets'] });
      }, 2000); // After coin flip animation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place bet: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  // Handle bet amount quick buttons
  const handleAmountButton = (action: string) => {
    if (action === "clear") {
      setBetAmount(0);
    } else if (action === "max") {
      setBetAmount(user?.balance || 10000);
    } else {
      const amount = parseInt(action.replace('+', ''));
      setBetAmount((prev) => prev + amount);
    }
  };

  // Handle bet on heads or tails
  const handleBet = (choice: "heads" | "tails") => {
    if (betAmount < 10 || betAmount > 10000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amount must be between 10 and 10,000",
        variant: "destructive",
      });
      return;
    }

    if (!user || user.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough coins to place this bet",
        variant: "destructive",
      });
      return;
    }

    playGame(choice);
  };

  // Play again
  const handlePlayAgain = () => {
    setShowResults(false);
    setGameResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Info Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-surface border-none h-full">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Coins className="text-accent mr-2" /> Coins Toss
            </h3>

            <div className="space-y-4">
              {/* Game Information */}
              <div>
                <h4 className="text-lg font-medium mb-2 text-primary">How to Play</h4>
                <p className="text-white/80 text-sm">
                  Guess if the coin will land on Heads or Tails. Place your bet and win 1.9x your stake if you guess correctly.
                </p>
              </div>

              {/* Stats */}
              <div className="bg-surface-light rounded-lg p-4">
                <h4 className="text-base font-medium mb-3 text-primary">Stats</h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface-light/50 p-2 rounded">
                    <div className="text-xs text-white/70 mb-1">Heads Streak</div>
                    <div className="text-lg font-medium">{stats.headsStreak} <span className="text-xs text-white/50">tosses</span></div>
                  </div>
                  <div className="bg-surface-light/50 p-2 rounded">
                    <div className="text-xs text-white/70 mb-1">Tails Streak</div>
                    <div className="text-lg font-medium">{stats.tailsStreak} <span className="text-xs text-white/50">tosses</span></div>
                  </div>
                  <div className="bg-surface-light/50 p-2 rounded">
                    <div className="text-xs text-white/70 mb-1">Win Rate</div>
                    <div className="text-lg font-medium text-secondary">{stats.winRate}%</div>
                  </div>
                  <div className="bg-surface-light/50 p-2 rounded">
                    <div className="text-xs text-white/70 mb-1">Best Win</div>
                    <div className="text-lg font-medium text-accent">{stats.bestWin.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div>
                <h4 className="text-lg font-medium mb-2 text-primary flex items-center">
                  <History className="mr-2 h-4 w-4" /> Recent Flips
                </h4>

                <div className="flex flex-wrap gap-2">
                  {isHistoryLoading ? (
                    Array(8).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-8 rounded-full" />
                    ))
                  ) : gameHistory && gameHistory.length > 0 ? (
                    gameHistory.map((history, index) => (
                      <div
                        key={index}
                        className={`h-8 w-8 rounded-full ${
                          history.result === "heads" ? "bg-primary" : "bg-accent"
                        } flex items-center justify-center font-medium`}
                        title={history.result === "heads" ? "Heads" : "Tails"}
                      >
                        {history.result === "heads" ? "H" : "T"}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/50 py-2 w-full">No flip history</div>
                  )}
                </div>
              </div>

              {/* Leaderboard Summary */}
              <div>
                <h4 className="text-lg font-medium mb-2 text-primary flex items-center">
                  <Trophy className="mr-2 h-4 w-4" /> Leaderboard
                </h4>

                <div className="space-y-2">
                  {[
                    { name: "Player429", winnings: 24500 },
                    { name: "CoinMaster", winnings: 18750 },
                    { name: "LuckyFlip", winnings: 12200 }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center bg-surface-light/50 p-2 rounded">
                      <div className="mr-2 h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-grow">{entry.name}</div>
                      <div className="text-secondary font-medium">+{entry.winnings.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Play Area */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-surface border-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-5 text-center">Flip the Coins</h3>

                  {/* Coins Display */}
                  <div className="flex justify-center mb-8">
                    <motion.div
                      className="coin relative h-48 w-48 flex items-center justify-center"
                      animate={isFlipping ? { rotateY: 1080 } : { rotateY: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-accent/30 bg-primary flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold">H</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Betting Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Bet Amount */}
                    <div className="bg-surface-light/30 p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-3">Bet Amount</h4>

                      <div className="relative">
                        <Input
                          type="number"
                          id="coin-bet-amount"
                          className="w-full bg-surface border border-surface-light rounded-lg py-3 px-4 pr-10"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          min={10}
                          max={10000}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Coins className="text-accent h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex justify-between mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 bg-surface-light rounded text-sm"
                          onClick={() => handleAmountButton("+100")}
                        >
                          +100
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 bg-surface-light rounded text-sm"
                          onClick={() => handleAmountButton("+500")}
                        >
                          +500
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 bg-surface-light rounded text-sm"
                          onClick={() => handleAmountButton("+1000")}
                        >
                          +1000
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 bg-surface-light rounded text-sm"
                          onClick={() => handleAmountButton("max")}
                        >
                          Max
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 bg-surface-light rounded text-sm"
                          onClick={() => handleAmountButton("clear")}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Potential Win */}
                    <div className="bg-surface-light/30 p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-3">Potential Win</h4>

                      <div className="bg-surface border border-surface-light rounded-lg py-3 px-4 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-medium text-secondary">
                            {calculatePotentialWin()}
                          </span>
                          <span className="text-xs text-white/50 ml-1">coins</span>
                        </div>
                        <div className="bg-secondary/20 text-secondary px-2 py-1 rounded text-sm">
                          1.9x
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-white/70">
                        <Info className="inline mr-1 h-3 w-3" />
                        Equal odds for both Heads and Tails.
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="bg-primary hover:bg-primary/80 text-white py-4 h-auto"
                      onClick={() => handleBet("heads")}
                      disabled={isPending || isFlipping}
                    >
                      <div className="h-8 w-8 rounded-full bg-white mr-2 flex items-center justify-center">
                        <span className="text-primary font-bold">H</span>
                      </div>
                      Bet on Heads
                    </Button>
                    <Button
                      className="bg-accent hover:bg-accent/80 text-white py-4 h-auto"
                      onClick={() => handleBet("tails")}
                      disabled={isPending || isFlipping}
                    >
                      <div className="h-8 w-8 rounded-full bg-white mr-2 flex items-center justify-center">
                        <span className="text-accent font-bold">T</span>
                      </div>
                      Bet on Tails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-surface border-none">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">Coins Flip Result</h3>

                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="coin relative h-20 w-20">
                        <div className={`absolute inset-0 rounded-full ${
                          gameResult?.result === "heads" ? "bg-primary" : "bg-accent"
                        } border-2 border-accent flex items-center justify-center`}>
                          <span className="text-xl font-bold">
                            {gameResult?.result === "heads" ? "H" : "T"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center mb-4"
                    >
                      <span className={`text-4xl font-bold ${gameResult?.isWin ? "text-secondary" : "text-destructive"}`}>
                        {gameResult?.isWin ? "You Won!" : "You Lost!"}
                      </span>
                      <div className="flex items-center justify-center mt-2 text-2xl">
                        <Coins className={`${gameResult?.isWin ? "text-accent" : "text-destructive"} mr-2 h-6 w-6`} />
                        <span>
                          {gameResult?.isWin ? "+" : ""}
                          {gameResult?.payout}
                        </span>
                      </div>
                    </motion.div>

                    <Button
                      className="mt-2 bg-primary hover:bg-primary/80 text-white"
                      onClick={handlePlayAgain}
                    >
                      Flip Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoinTossGame;
