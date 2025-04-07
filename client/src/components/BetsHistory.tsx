import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dice5, Coins } from "lucide-react";

interface Bet {
  id: number;
  gameType: string;
  betAmount: number;
  selection: string;
  result: string;
  payout: number;
  isWin: boolean;
  createdAt: string;
}

const BetsHistory: React.FC = () => {
  const { data: bets, isLoading } = useQuery<Bet[]>({
    queryKey: ['/api/user/bets'],
  });

  // Format the selection display
  const formatSelection = (gameType: string, selection: string) => {
    if (gameType === "satta_matka") {
      return (
        <div className="flex space-x-1">
          {selection.split(",").map((num, idx) => (
            <span key={idx} className="bg-primary/20 px-1 rounded">{num}</span>
          ))}
        </div>
      );
    } else {
      return (
        <span className={`bg-${selection === "heads" ? "primary" : "accent"}/20 px-2 rounded`}>
          {selection.charAt(0).toUpperCase() + selection.slice(1)}
        </span>
      );
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Recent Bets</h2>

      <Card className="bg-surface border-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-surface-light">
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Game</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Time</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Bet Amount</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Selection</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Result</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-white/70">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : bets && bets.length > 0 ? (
                bets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-surface-light/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {bet.gameType === "satta_matka" ? (
                          <Dice5 className="text-accent mr-2 h-4 w-4" />
                        ) : (
                          <Coins className="text-accent mr-2 h-4 w-4" />
                        )}
                        <span>
                          {bet.gameType === "satta_matka" ? "Satta Matka" : "Coins Toss"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/70">
                      {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </td>
                    <td className="py-3 px-4">{bet.betAmount}</td>
                    <td className="py-3 px-4">
                      {formatSelection(bet.gameType, bet.selection)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${
                        bet.isWin ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                      } px-2 py-1 rounded-full text-xs`}>
                        {bet.isWin ? "Win" : "Loss"}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${
                      bet.isWin ? "text-secondary" : "text-destructive"
                    } font-medium`}>
                      {bet.isWin ? "+" : ""}
                      {bet.payout}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/50">
                    No bet history available. Start playing to see your bets here!
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
