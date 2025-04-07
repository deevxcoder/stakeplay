import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dice5, Clock, History, Calendar, AlertCircle,
  Coins, Target, Hash, Divide, ArrowLeftRight, RefreshCcw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Result format for Satta Matka (now two digits 00-99)
type SattaMatkaResult = {
  result: string; // Change to string for two-digit result (00-99)
  isWin: boolean;
  payout: number;
  newBalance: number;
};

// Betting types
type BetType = "jodi" | "oddEven" | "cross" | "hurf";

// Markets
type MarketType = "gali" | "dishawar" | "mumbai";

// Game history item type
interface GameHistoryItem {
  id: number;
  gameType: string;
  result: string;
  timestamp: string;
  market?: string;
}

const SattaMatkaGame: React.FC = () => {
  const { user, updateBalance } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States for game
  const [betType, setBetType] = useState<BetType>("jodi");
  const [market, setMarket] = useState<MarketType>("gali");
  const [betAmount, setBetAmount] = useState<number>(100);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SattaMatkaResult | null>(null);
  
  // Timer state - 1 hour (3600 seconds) for round duration
  const [roundStatus, setRoundStatus] = useState<"open" | "closed" | "results">("open");
  const [remainingTime, setRemainingTime] = useState<number>(3600); 
  
  // Bet selection states - different for each bet type
  const [jodiSelection, setJodiSelection] = useState<string>("");
  const [oddEvenSelection, setOddEvenSelection] = useState<"odd" | "even" | "">("");
  const [crossNumbers, setCrossNumbers] = useState<number[]>([]);
  const [hurfLeftDigit, setHurfLeftDigit] = useState<number | null>(null);
  const [hurfRightDigit, setHurfRightDigit] = useState<number | null>(null);

  // Query for game history with market filter
  const { data: gameHistory, isLoading: isHistoryLoading } = useQuery<GameHistoryItem[]>({
    queryKey: ['/api/games/matka/history', market],
    queryFn: async () => {
      const response = await fetch(`/api/games/matka/history?market=${market}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  });

  // Start timer countdown - simulate game rounds
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        // If time's up
        if (prev <= 0) {
          // If in open state, transition to closed
          if (roundStatus === "open") {
            setRoundStatus("closed");
            return 600; // 10 minutes of closed time
          }
          // If in closed state, transition to results
          else if (roundStatus === "closed") {
            setRoundStatus("results");
            return 60; // 1 minute to display results
          }
          // If in results state, start new round
          else {
            setRoundStatus("open");
            return 3600; // 1 hour for next round
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStatus]);

  // Format remaining time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format market name for display
  const formatMarketName = (marketType: MarketType): string => {
    switch (marketType) {
      case "gali": return "Gali";
      case "dishawar": return "Dishawar";
      case "mumbai": return "Mumbai";
      default: return "Unknown";
    }
  };

  // Generate array of two-digit numbers (00-99)
  const generateTwoDigitNumbers = (): string[] => {
    const numbers: string[] = [];
    for (let i = 0; i < 100; i++) {
      numbers.push(i.toString().padStart(2, '0'));
    }
    return numbers;
  };

  // Handle Jodi number selection
  const handleJodiSelection = (num: string) => {
    setJodiSelection(num);
  };

  // Handle Odd/Even selection
  const handleOddEvenSelection = (selection: "odd" | "even") => {
    setOddEvenSelection(selection);
  };

  // Handle Cross number selection
  const handleCrossNumberSelect = (num: number) => {
    if (crossNumbers.includes(num)) {
      // Remove number if already selected
      setCrossNumbers(crossNumbers.filter((n) => n !== num));
    } else if (crossNumbers.length < 5) { // Limit to 5 numbers
      // Add number
      setCrossNumbers([...crossNumbers, num]);
    }
  };

  // Calculate cross combinations
  const calculateCrossCombinations = (): string[] => {
    const combinations: string[] = [];
    
    for (let i = 0; i < crossNumbers.length; i++) {
      for (let j = 0; j < crossNumbers.length; j++) {
        if (i !== j) {
          combinations.push(`${crossNumbers[i]}${crossNumbers[j]}`);
        }
      }
    }
    
    return combinations;
  };

  // Handle Hurf digit selection
  const handleHurfDigitSelect = (position: "left" | "right", digit: number | null) => {
    if (position === "left") {
      setHurfLeftDigit(digit);
    } else {
      setHurfRightDigit(digit);
    }
  };

  // Reset selection based on current bet type
  const handleReset = () => {
    if (betType === "jodi") {
      setJodiSelection("");
    } else if (betType === "oddEven") {
      setOddEvenSelection("");
    } else if (betType === "cross") {
      setCrossNumbers([]);
    } else if (betType === "hurf") {
      setHurfLeftDigit(null);
      setHurfRightDigit(null);
    }
    setBetAmount(100);
  };

  // Calculate potential win based on bet type
  const calculatePotentialWin = (): number => {
    let multiplier = 1;
    
    switch (betType) {
      case "jodi":
        multiplier = 90; // Higher payout for exact match
        break;
      case "oddEven":
        multiplier = 1.9; // Lower payout for 50% chance
        break;
      case "cross":
        // Payout depends on number of combinations
        const combinations = calculateCrossCombinations();
        multiplier = Math.max(90 / combinations.length, 1.5);
        break;
      case "hurf":
        // If both left and right selected, divide by 2
        if (hurfLeftDigit !== null && hurfRightDigit !== null) {
          multiplier = 4.5;
        } else {
          multiplier = 9; // Only one digit selected
        }
        break;
    }
    
    return Math.floor(betAmount * multiplier);
  };

  // Check if bet is valid based on current bet type
  const isValidBet = (): boolean => {
    switch (betType) {
      case "jodi":
        return !!jodiSelection;
      case "oddEven":
        return !!oddEvenSelection;
      case "cross":
        return crossNumbers.length >= 2;
      case "hurf":
        return hurfLeftDigit !== null || hurfRightDigit !== null;
      default:
        return false;
    }
  };

  // Get current bet selection description for toast
  const getBetDescription = (): string => {
    switch (betType) {
      case "jodi":
        return `Jodi: ${jodiSelection}`;
      case "oddEven":
        return `${oddEvenSelection === "odd" ? "Odd" : "Even"}`;
      case "cross":
        return `Cross: ${calculateCrossCombinations().join(", ")}`;
      case "hurf":
        let desc = "Hurf: ";
        if (hurfLeftDigit !== null) {
          desc += `Left ${hurfLeftDigit}`;
        }
        if (hurfRightDigit !== null) {
          desc += hurfLeftDigit !== null ? `, Right ${hurfRightDigit}` : `Right ${hurfRightDigit}`;
        }
        return desc;
      default:
        return "";
    }
  };

  // Play game mutation
  const { mutate: playGame, isPending } = useMutation({
    mutationFn: async () => {
      // Construct bet data based on current bet type
      let betData: any = {
        betType,
        market,
        betAmount
      };
      
      switch (betType) {
        case "jodi":
          betData.selection = jodiSelection;
          break;
        case "oddEven":
          betData.selection = oddEvenSelection;
          break;
        case "cross":
          betData.selection = crossNumbers;
          break;
        case "hurf":
          betData.leftDigit = hurfLeftDigit;
          betData.rightDigit = hurfRightDigit;
          break;
      }
      
      const res = await apiRequest('POST', '/api/games/matka/play', betData);
      const data = await res.json();
      return data as SattaMatkaResult;
    },
    onSuccess: (data) => {
      setGameResult(data);
      updateBalance(data.newBalance);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/games/matka/history', market] });
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
    if (!isValidBet()) {
      toast({
        title: "Selection Incomplete",
        description: "Please complete your selection based on the bet type",
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

    // If game round is closed, don't allow bets
    if (roundStatus !== "open") {
      toast({
        title: "Betting Closed",
        description: "This round is currently closed for betting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bet Placed",
      description: `${formatMarketName(market)}: ${getBetDescription()} - ${betAmount} coins`,
    });
    playGame();
  };

  // Play again
  const handlePlayAgain = () => {
    setShowResults(false);
    setGameResult(null);
    handleReset();
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
                  Satta Matka is a popular betting game. Choose a market and bet type, 
                  then place your bet before the round ends to win big!
                </p>
              </div>

              {/* Market Selection */}
              <div className="bg-surface-light/50 rounded-lg p-3">
                <h4 className="text-base font-medium mb-2 flex items-center text-primary">
                  <Target className="h-4 w-4 mr-2" /> Select Market
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['gali', 'dishawar', 'mumbai'] as MarketType[]).map((mkt) => (
                    <Button
                      key={mkt}
                      variant={market === mkt ? "default" : "outline"}
                      className={`py-1 h-auto ${market === mkt ? "bg-primary" : "bg-surface border border-white/10"}`}
                      onClick={() => setMarket(mkt)}
                    >
                      {formatMarketName(mkt)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Round Info */}
              <div className="bg-surface-light rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Current Round</span>
                  <span className="text-sm font-medium bg-primary/20 text-primary px-2 py-1 rounded">
                    {formatMarketName(market)}-{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/70">Status</span>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    roundStatus === "open" 
                      ? "bg-green-500/20 text-green-500" 
                      : roundStatus === "closed" 
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-primary/20 text-primary"
                  }`}>
                    {roundStatus === "open" 
                      ? "Open for Betting" 
                      : roundStatus === "closed" 
                        ? "Closed - Awaiting Result" 
                        : "Results Declared"
                    }
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">
                    {roundStatus === "open" 
                      ? "Betting Closes In" 
                      : roundStatus === "closed" 
                        ? "Results In" 
                        : "Next Round In"
                    }
                  </span>
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
                    gameHistory.map((history, index) => (
                      <div key={index} className="flex justify-between items-center bg-surface-light/50 rounded p-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {history.market ? formatMarketName(history.market as MarketType) : "Matka"}
                          </span>
                          <span className="text-white/60 text-xs">
                            {new Date(history.timestamp).toLocaleString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold">
                            {history.result}
                          </div>
                        </div>
                      </div>
                    ))
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
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-semibold">
                      {formatMarketName(market)} Matka
                    </h3>
                    {roundStatus !== "open" && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/50">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Betting Currently Closed
                      </Badge>
                    )}
                  </div>

                  {/* Bet Type Tabs */}
                  <Tabs defaultValue="jodi" onValueChange={(value) => setBetType(value as BetType)} className="mb-6">
                    <TabsList className="grid grid-cols-4 bg-surface-light mb-4">
                      <TabsTrigger value="jodi" className="data-[state=active]:bg-primary">
                        <Hash className="h-4 w-4 mr-2" />
                        Jodi
                      </TabsTrigger>
                      <TabsTrigger value="oddEven" className="data-[state=active]:bg-primary">
                        <Divide className="h-4 w-4 mr-2" />
                        Odd/Even
                      </TabsTrigger>
                      <TabsTrigger value="cross" className="data-[state=active]:bg-primary">
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Cross
                      </TabsTrigger>
                      <TabsTrigger value="hurf" className="data-[state=active]:bg-primary">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Hurf
                      </TabsTrigger>
                    </TabsList>

                    {/* Jodi Bet Type - Select a specific two-digit number */}
                    <TabsContent value="jodi" className="mt-0">
                      <div className="rounded-lg bg-surface-light/30 p-4 mb-4">
                        <h4 className="font-medium mb-3">Select a two-digit number (00-99)</h4>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                          {generateTwoDigitNumbers().map((num) => (
                            <Button
                              key={num}
                              onClick={() => handleJodiSelection(num)}
                              variant={jodiSelection === num ? "default" : "outline"}
                              className={`h-10 p-0 ${
                                jodiSelection === num
                                  ? "bg-primary hover:bg-primary/90"
                                  : "bg-surface-light hover:bg-primary/50"
                              }`}
                              size="sm"
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {jodiSelection && (
                        <div className="mb-4 text-center">
                          <h4 className="font-medium mb-2">Your Selection</h4>
                          <div className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-2xl font-bold">
                            {jodiSelection}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Odd/Even Bet Type */}
                    <TabsContent value="oddEven" className="mt-0">
                      <div className="rounded-lg bg-surface-light/30 p-4 mb-4">
                        <h4 className="font-medium mb-3">Choose Odd or Even</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <RadioGroup value={oddEvenSelection} onValueChange={(val: any) => setOddEvenSelection(val)}>
                            <div className="flex items-center justify-center space-x-2 bg-surface p-4 rounded-lg cursor-pointer hover:bg-surface-light">
                              <RadioGroupItem value="odd" id="odd" className="text-primary" />
                              <Label htmlFor="odd" className="font-medium text-lg cursor-pointer">
                                Odd (1, 3, 5, 7, 9...)
                              </Label>
                            </div>
                            <div className="flex items-center justify-center space-x-2 bg-surface p-4 rounded-lg cursor-pointer hover:bg-surface-light">
                              <RadioGroupItem value="even" id="even" className="text-primary" />
                              <Label htmlFor="even" className="font-medium text-lg cursor-pointer">
                                Even (0, 2, 4, 6, 8...)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      {oddEvenSelection && (
                        <div className="mb-4 text-center">
                          <h4 className="font-medium mb-2">Your Selection</h4>
                          <div className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-2xl font-bold capitalize">
                            {oddEvenSelection}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Cross Bet Type */}
                    <TabsContent value="cross" className="mt-0">
                      <div className="rounded-lg bg-surface-light/30 p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Select 2-5 digits to create combinations</h4>
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            {crossNumbers.length}/5 Selected
                          </Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {Array.from({ length: 10 }, (_, i) => (
                            <Button
                              key={i}
                              onClick={() => handleCrossNumberSelect(i)}
                              variant={crossNumbers.includes(i) ? "default" : "outline"}
                              className={`number-ball rounded-full flex items-center justify-center w-12 h-12 text-lg font-medium p-0 ${
                                crossNumbers.includes(i)
                                  ? "bg-primary hover:bg-primary/90"
                                  : "bg-surface-light hover:bg-primary/70"
                              }`}
                              disabled={crossNumbers.length >= 5 && !crossNumbers.includes(i)}
                            >
                              {i}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {crossNumbers.length >= 2 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Your Combinations ({calculateCrossCombinations().length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {calculateCrossCombinations().map((combo, idx) => (
                              <Badge key={idx} className="bg-primary/20 text-primary text-sm py-1">
                                {combo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Hurf Bet Type */}
                    <TabsContent value="hurf" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Left Digit */}
                        <div className="rounded-lg bg-surface-light/30 p-4">
                          <h4 className="font-medium mb-3">Left Digit (First Position)</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 10 }, (_, i) => (
                              <Button
                                key={i}
                                onClick={() => handleHurfDigitSelect("left", hurfLeftDigit === i ? null : i)}
                                variant={hurfLeftDigit === i ? "default" : "outline"}
                                className={`number-ball rounded-full flex items-center justify-center w-10 h-10 text-lg font-medium p-0 ${
                                  hurfLeftDigit === i
                                    ? "bg-primary hover:bg-primary/90"
                                    : "bg-surface-light hover:bg-primary/70"
                                }`}
                              >
                                {i}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Right Digit */}
                        <div className="rounded-lg bg-surface-light/30 p-4">
                          <h4 className="font-medium mb-3">Right Digit (Second Position)</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 10 }, (_, i) => (
                              <Button
                                key={i}
                                onClick={() => handleHurfDigitSelect("right", hurfRightDigit === i ? null : i)}
                                variant={hurfRightDigit === i ? "default" : "outline"}
                                className={`number-ball rounded-full flex items-center justify-center w-10 h-10 text-lg font-medium p-0 ${
                                  hurfRightDigit === i
                                    ? "bg-primary hover:bg-primary/90"
                                    : "bg-surface-light hover:bg-primary/70"
                                }`}
                              >
                                {i}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {(hurfLeftDigit !== null || hurfRightDigit !== null) && (
                        <div className="mb-4 text-center">
                          <h4 className="font-medium mb-2">Your Selection</h4>
                          <div className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-2xl font-bold">
                            {hurfLeftDigit !== null ? hurfLeftDigit : "*"}
                            {hurfRightDigit !== null ? hurfRightDigit : "*"}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

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
                            x{(calculatePotentialWin() / betAmount).toFixed(1)}
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
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Reset Selection
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/80 text-white"
                      onClick={handlePlaceBet}
                      disabled={isPending || roundStatus !== "open" || !isValidBet()}
                    >
                      <Dice5 className="h-4 w-4 mr-2" />
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
                  <h3 className="text-xl font-semibold mb-4 text-center">Bet Results</h3>

                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <span className="text-white/70">Winning Number</span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 bg-primary rounded-lg p-5 inline-flex items-center justify-center shadow-lg shadow-primary/20"
                      >
                        <span className="text-4xl font-bold text-white">
                          {gameResult?.result}
                        </span>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center mb-4"
                    >
                      <div className="text-white/70 mb-1">Your Bet</div>
                      <div className="px-4 py-2 rounded-lg bg-surface-light inline-block">
                        {getBetDescription()}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-center mb-6"
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
                      className="mt-2 bg-primary hover:bg-primary/80 text-white px-6"
                      onClick={handlePlayAgain}
                    >
                      Place Another Bet
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
