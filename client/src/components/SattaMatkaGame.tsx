import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, Clock, History, InfoIcon, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SattaMatkaResult = {
  result: number[];
  isWin: boolean;
  payout: number;
  newBalance: number;
};

const SattaMatkaGame: React.FC = () => {
  const { user, updateBalance } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SattaMatkaResult | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(180); // 3 minutes in seconds

  // Define game history type
  interface GameHistoryItem {
    id: number;
    gameType: string;
    result: string;
    timestamp: string;
  }

  // Query for game history
  const { data: gameHistory, isLoading: isHistoryLoading } = useQuery<GameHistoryItem[]>({
    queryKey: ['/api/games/matka/history'],
  });

  // Start timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) {
          // Reset timer to 3 minutes when it reaches 0
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle number selection
  const handleNumberSelect = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // Remove number if already selected
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 3) {
      // Add number if less than 3 are selected
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  // Reset selection
  const handleReset = () => {
    setSelectedNumbers([]);
    setBetAmount(100);
  };

  // Calculate potential win
  const calculatePotentialWin = (): number => {
    return Math.floor(betAmount * 7.5);
  };

  // Play game mutation
  const { mutate: playGame, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/games/matka/play', {
        selectedNumbers,
        betAmount
      });
      const data = await res.json();
      return data as SattaMatkaResult;
    },
    onSuccess: (data) => {
      setGameResult(data);
      updateBalance(data.newBalance);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/games/matka/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/bets'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place bet: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  // Handle place bet
  const handlePlaceBet = () => {
    if (selectedNumbers.length !== 3) {
      toast({
        title: "Selection Incomplete",
        description: "Please select exactly 3 numbers",
        variant: "destructive",
      });
      return;
    }

    if (betAmount < 100 || betAmount > 10000) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amount must be between 100 and 10,000",
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

    playGame();
  };

  // Play again
  const handlePlayAgain = () => {
    setShowResults(false);
    setGameResult(null);
    setSelectedNumbers([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Info Panel */}
      <div className="lg:col-span-1">
        <Card className="bg-surface border-none h-full">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Dice5 className="text-accent mr-2" /> Satta Matka
            </h3>

            <div className="space-y-4">
              {/* Game Information */}
              <div>
                <h4 className="text-lg font-medium mb-2 text-primary">How to Play</h4>
                <p className="text-white/80 text-sm">
                  Satta Matka is a popular lottery game. Select your numbers, place your bet, 
                  and win if your numbers match the drawn numbers.
                </p>
              </div>

              {/* Current Round Info */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Current Round</span>
                  <span className="text-sm font-medium bg-primary/20 text-primary px-2 py-1 rounded">
                    #MT-{new Date().getFullYear()}-{Math.floor(Math.random() * 100)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Round Ends In</span>
                  <div className="flex items-center space-x-1 pulse-animation">
                    <span className="text-white font-medium">{formatTime(remainingTime)}</span>
                    <Clock className="text-accent h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Previous Results */}
              <div>
                <h4 className="text-lg font-medium mb-2 flex items-center text-primary">
                  <History className="mr-2 h-4 w-4" /> Previous Results
                </h4>

                <div className="space-y-2">
                  {isHistoryLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))
                  ) : gameHistory && gameHistory.length > 0 ? (
                    gameHistory.map((history, index) => {
                      const resultNumbers = history.result.split(',').map(Number);
                      return (
                        <div key={index} className="flex justify-between items-center bg-surface-light/50 rounded p-2 text-sm">
                          <span className="text-white/70">
                            #MT-{new Date(history.timestamp).toLocaleString(undefined, { 
                              month: 'numeric', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <div className="flex space-x-1">
                            {resultNumbers.map((num: number, i: number) => {
                              const colors = ["bg-accent/20 text-accent", "bg-primary/20 text-primary", "bg-secondary/20 text-secondary"];
                              return (
                                <span key={i} className={`${colors[i]} px-2 rounded`}>
                                  {num}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-white/50 py-2">No previous results</div>
                  )}
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
                  <h3 className="text-xl font-semibold mb-5">Select Your Numbers</h3>

                  {/* Number Selection */}
                  <div className="mb-6">
                    <div className="grid grid-cols-5 gap-3 sm:gap-4">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Button
                          key={i}
                          onClick={() => handleNumberSelect(i)}
                          variant={selectedNumbers.includes(i) ? "default" : "outline"}
                          className={`number-ball rounded-full flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-lg font-medium p-0 ${
                            selectedNumbers.includes(i)
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-surface-light hover:bg-primary/70"
                          }`}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Numbers */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3">Your Selected Numbers</h4>
                    <div className="bg-surface-light/50 p-4 rounded-lg flex items-center justify-center space-x-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className="number-ball bg-primary/20 rounded-full flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-lg font-medium"
                        >
                          <span>{selectedNumbers[i] !== undefined ? selectedNumbers[i] : "?"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Betting Controls */}
                  <div className="bg-surface-light/30 p-4 rounded-lg mb-6">
                    <h4 className="text-lg font-medium mb-3">Place Your Bet</h4>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <label htmlFor="bet-amount" className="text-sm text-white/70 mr-2">
                            Bet Amount
                          </label>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            Min: 100
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            id="bet-amount"
                            className="w-full bg-surface border border-surface-light rounded-lg py-2 px-4 pr-10"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            min={100}
                            max={10000}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Coins className="text-accent h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <label htmlFor="potential-win" className="text-sm text-white/70 mr-2">
                            Potential Win
                          </label>
                          <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">
                            x7.5
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            type="text"
                            id="potential-win"
                            className="w-full bg-surface border border-surface-light rounded-lg py-2 px-4 pr-10 cursor-not-allowed"
                            value={calculatePotentialWin()}
                            readOnly
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Coins className="text-secondary h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-surface-light hover:bg-surface-light/70 text-white"
                      onClick={handleReset}
                    >
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
                        className="lucide lucide-rotate-cw mr-2"
                      >
                        <path d="M21 2v6h-6" />
                        <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
                      </svg>
                      Reset Selection
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/80 text-white"
                      onClick={handlePlaceBet}
                      disabled={isPending}
                    >
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
                        className="lucide lucide-check-circle mr-2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="m9 11 3 3L22 4" />
                      </svg>
                      {isPending ? "Placing Bet..." : "Place Bet"}
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
                  <h3 className="text-xl font-semibold mb-4 text-center">Round Results</h3>

                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <span className="text-white/70">Winning Numbers</span>
                      <div className="flex justify-center mt-2 space-x-4">
                        {gameResult?.result.map((num, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 }}
                            className={`rounded-full flex items-center justify-center w-12 h-12 text-lg font-bold ${
                              index === 0
                                ? "bg-accent"
                                : index === 1
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
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
                      Play Again
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

export default SattaMatkaGame;
