import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dice5, Coins, History, Trophy, XCircle } from "lucide-react";

interface Bet {
  id: number;
  gameType: string;
  betAmount: number;
  selection: string;
  result: string;
  payout: number;
  isWin: boolean;
  createdAt: string;
  market?: string;
  betType?: string;
}

const BetsHistory: React.FC = () => {
  const { data: bets, isLoading } = useQuery<Bet[]>({
    queryKey: ['/api/user/bets'],
  });

  // Format market name for display
  const formatMarketName = (market?: string): string => {
    if (!market) return "";
    switch (market) {
      case "gali": return "Gali";
      case "dishawar": return "Dishawar";
      case "mumbai": return "Mumbai";
      default: return market.charAt(0).toUpperCase() + market.slice(1);
    }
  };

  // Format bet type for display
  const formatBetType = (betType?: string): string => {
    if (!betType) return "";
    switch (betType) {
      case "jodi": return "Jodi";
      case "oddEven": return "Odd/Even";
      case "cross": return "Cross";
      case "hurf": return "Hurf";
      default: return betType.charAt(0).toUpperCase() + betType.slice(1);
    }
  };

  // Format the selection display
  const formatSelection = (bet: Bet) => {
    const { gameType, selection, betType } = bet;
    
    if (gameType === "satta_matka") {
      if (betType === "jodi") {
        return (
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {selection}
          </span>
        );
      } else if (betType === "oddEven") {
        return (
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
            {selection}
          </span>
        );
      } else if (betType === "cross") {
        return (
          <div className="flex flex-wrap gap-1">
            {selection.split(",").map((num, idx) => (
              <span key={idx} className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">{num}</span>
            ))}
          </div>
        );
      } else if (betType === "hurf") {
        // Handle Hurf display - usually in format "left:X,right:Y"
        if (selection.includes("left:") || selection.includes("right:")) {
          const parts = selection.split(",");
          return (
            <div className="flex flex-col gap-1">
              {parts.map((part, idx) => {
                const [pos, val] = part.split(":");
                if (val && val !== "null") {
                  return (
                    <span key={idx} className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                      {pos}: {val}
                    </span>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          );
        }
        // Fallback for other formats
        return (
          <div className="flex flex-wrap gap-1">
            {selection.split(",").map((num, idx) => (
              <span key={idx} className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">{num}</span>
            ))}
          </div>
        );
      } else {
        // Original legacy format
        return (
          <div className="flex flex-wrap gap-1">
            {selection.split(",").map((num, idx) => (
              <span key={idx} className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">{num}</span>
            ))}
          </div>
        );
      }
    } else {
      // Coin toss format (unchanged)
      const bgColor = selection === "heads" ? "primary" : "amber";
      return (
        <span className={`bg-${bgColor}/20 text-${bgColor}-400 px-2 py-0.5 rounded-full text-xs font-medium`}>
          {selection.charAt(0).toUpperCase() + selection.slice(1)}
        </span>
      );
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center mb-6">
        <History className="mr-3 h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Your Betting History</h2>
      </div>

      <Card className="bg-surface border border-white/5 overflow-hidden shadow-xl"
        style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-surface-light border-b border-white/10">
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Game</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Time</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Bet Amount</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Selection</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Result</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-white/80">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : bets && bets.length > 0 ? (
                bets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-surface-light/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {bet.gameType === "satta_matka" ? (
                            <Dice5 className="text-amber-400 mr-2 h-5 w-5" />
                          ) : (
                            <Coins className="text-amber-400 mr-2 h-5 w-5" />
                          )}
                          <span className="font-medium">
                            {bet.gameType === "satta_matka" ? "Satta Matka" : "Coin Toss"}
                          </span>
                        </div>
                        {bet.gameType === "satta_matka" && (bet.market || bet.betType) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {bet.market && (
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary/90 rounded-full">
                                {formatMarketName(bet.market)}
                              </span>
                            )}
                            {bet.betType && (
                              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">
                                {formatBetType(bet.betType)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-white/70">
                      {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <span className="text-amber-400">{bet.betAmount}</span>
                    </td>
                    <td className="py-4 px-6">
                      {formatSelection(bet)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center ${
                        bet.isWin 
                          ? "text-emerald-400" 
                          : "text-rose-500"
                      }`}>
                        {bet.isWin ? (
                          <Trophy className="h-4 w-4 mr-1.5" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1.5" />
                        )}
                        <span className="font-medium">
                          {bet.isWin ? "Win" : "Loss"}
                        </span>
                      </span>
                    </td>
                    <td className={`py-4 px-6 font-bold ${
                      bet.isWin ? "text-emerald-400" : "text-rose-500"
                    }`}>
                      {bet.isWin ? "+" : "-"}
                      {bet.payout}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <History className="h-12 w-12 text-white/20 mb-3" />
                      <p className="text-white/70 mb-2">No betting history yet.</p>
                      <p className="text-primary">Place your first bet to see it here!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BetsHistory;
