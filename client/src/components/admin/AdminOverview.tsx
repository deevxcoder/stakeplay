import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, Users, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { Deposit, Withdrawal, Bet } from "@shared/schema";

export default function AdminOverview() {
  // Fetch admin dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });
  
  // Fetch recent activity
  const { data: recentDeposits = [], isLoading: isLoadingDeposits } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits/recent"],
    retry: false,
  });
  
  const { data: recentWithdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals/recent"],
    retry: false,
  });
  
  const { data: recentBets = [], isLoading: isLoadingBets } = useQuery<Bet[]>({
    queryKey: ["/api/admin/bets/recent"],
    retry: false,
  });
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm");
  };
  
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "" : `+${stats?.newUsersToday || 0} today`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Deposits</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : formatAmount(stats?.totalDeposits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "" : `${stats?.pendingDeposits || 0} pending approvals`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Withdrawals</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : formatAmount(stats?.totalWithdrawals || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "" : `${stats?.pendingWithdrawals || 0} pending requests`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "Loading..." : formatAmount(stats?.platformProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "" : `+${formatAmount(stats?.profitToday || 0)} today`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tabs */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="deposits">Deposit Requests</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
            <TabsTrigger value="bets">Recent Bets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposits">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">User</th>
                        <th className="py-3 px-4 text-left font-medium">Amount</th>
                        <th className="py-3 px-4 text-left font-medium">Method</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingDeposits ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">Loading...</td>
                        </tr>
                      ) : recentDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">No recent deposits</td>
                        </tr>
                      ) : (
                        recentDeposits.map((deposit) => (
                          <tr key={deposit.id} className="border-b">
                            <td className="py-3 px-4">{deposit.userId}</td>
                            <td className="py-3 px-4">{formatAmount(deposit.amount)}</td>
                            <td className="py-3 px-4 capitalize">{deposit.paymentMode}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                deposit.status === "approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : deposit.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {deposit.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{formatDate(deposit.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">User</th>
                        <th className="py-3 px-4 text-left font-medium">Amount</th>
                        <th className="py-3 px-4 text-left font-medium">Method</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingWithdrawals ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">Loading...</td>
                        </tr>
                      ) : recentWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">No recent withdrawals</td>
                        </tr>
                      ) : (
                        recentWithdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="border-b">
                            <td className="py-3 px-4">{withdrawal.userId}</td>
                            <td className="py-3 px-4">{formatAmount(withdrawal.amount)}</td>
                            <td className="py-3 px-4 capitalize">{withdrawal.paymentMode}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                withdrawal.status === "approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : withdrawal.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {withdrawal.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{formatDate(withdrawal.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bets">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">User</th>
                        <th className="py-3 px-4 text-left font-medium">Game</th>
                        <th className="py-3 px-4 text-left font-medium">Bet Amount</th>
                        <th className="py-3 px-4 text-left font-medium">Selection</th>
                        <th className="py-3 px-4 text-left font-medium">Result</th>
                        <th className="py-3 px-4 text-left font-medium">Win/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingBets ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">Loading...</td>
                        </tr>
                      ) : recentBets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">No recent bets</td>
                        </tr>
                      ) : (
                        recentBets.map((bet) => (
                          <tr key={bet.id} className="border-b">
                            <td className="py-3 px-4">{bet.userId}</td>
                            <td className="py-3 px-4">{bet.gameType}</td>
                            <td className="py-3 px-4">{formatAmount(bet.betAmount)}</td>
                            <td className="py-3 px-4">{bet.selection}</td>
                            <td className="py-3 px-4">{bet.result}</td>
                            <td className="py-3 px-4">
                              <span className={bet.isWin ? "text-green-600" : "text-red-600"}>
                                {bet.isWin ? "Won" : "Lost"} {formatAmount(bet.payout)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}