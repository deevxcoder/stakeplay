import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, CircleDollarSign, ArrowUpFromLine, ArrowDownToLine, Clock, CheckCircle, XCircle, FileText, Info } from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { formatAmount, formatTimeAgo } from "@/lib/gameUtils";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";

type PaymentMode = "upi" | "bank" | "cash";

// UPI details form
const UpiForm = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="upiId">UPI ID</Label>
        <Input 
          id="upiId" 
          placeholder="yourname@upi" 
          value={formData.upiId || ""} 
          onChange={(e) => setFormData({...formData, upiId: e.target.value})}
        />
        <p className="text-xs text-muted-foreground">Enter your UPI ID (e.g., name@bank)</p>
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="utrNumber">UTR Number (Reference ID)</Label>
        <Input 
          id="utrNumber" 
          placeholder="UTR123456789" 
          value={formData.utrNumber || ""} 
          onChange={(e) => setFormData({...formData, utrNumber: e.target.value})}
        />
        <p className="text-xs text-muted-foreground">Enter after making payment, if available</p>
      </div>
    </div>
  );
};

// Bank details form
const BankForm = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input 
          id="accountNumber" 
          placeholder="Your account number" 
          value={formData.accountNumber || ""} 
          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
        />
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input 
          id="ifscCode" 
          placeholder="BANK0012345" 
          value={formData.ifscCode || ""} 
          onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
        />
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="accountHolderName">Account Holder Name</Label>
        <Input 
          id="accountHolderName" 
          placeholder="Your name" 
          value={formData.accountHolderName || ""} 
          onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
        />
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input 
          id="bankName" 
          placeholder="Bank name" 
          value={formData.bankName || ""} 
          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
        />
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="transactionId">Transaction ID</Label>
        <Input 
          id="transactionId" 
          placeholder="TXN123456789" 
          value={formData.transactionId || ""} 
          onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
        />
        <p className="text-xs text-muted-foreground">Enter after making payment, if available</p>
      </div>
    </div>
  );
};

// Cash details form
const CashForm = ({ formData, setFormData }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="adminName">Admin Name</Label>
        <Input 
          id="adminName" 
          placeholder="Admin's name" 
          value={formData.adminName || ""} 
          onChange={(e) => setFormData({...formData, adminName: e.target.value})}
        />
        <p className="text-xs text-muted-foreground">Enter the name of admin you'll hand over cash to</p>
      </div>
      
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input 
          id="location" 
          placeholder="Meeting location" 
          value={formData.location || ""} 
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let icon = <Clock className="w-3 h-3 mr-1" />;
  
  if (status === "approved") {
    variant = "default";
    icon = <CheckCircle className="w-3 h-3 mr-1" />;
  } else if (status === "rejected") {
    variant = "destructive";
    icon = <XCircle className="w-3 h-3 mr-1" />;
  } else {
    variant = "secondary";
  }
  
  return (
    <Badge variant={variant} className="capitalize">
      {icon}
      {status}
    </Badge>
  );
};

// Transaction Detail Dialog
const TransactionDetailDialog = ({ transaction, type }: { transaction: any, type: "deposit" | "withdrawal" }) => {
  const displayTitle = type === "deposit" ? "Deposit" : "Withdrawal";
  const displayIcon = type === "deposit" ? <ArrowDownToLine className="w-4 h-4 mr-2" /> : <ArrowUpFromLine className="w-4 h-4 mr-2" />;
  
  // Format the payment details based on payment mode
  const renderPaymentDetails = () => {
    const details = transaction.details;
    if (!details) return <p>No details available</p>;
    
    if (transaction.paymentMode === "upi") {
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">UPI ID:</span>
            <span>{details.upiId}</span>
          </div>
          {details.utrNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">UTR Number:</span>
              <span>{details.utrNumber}</span>
            </div>
          )}
        </div>
      );
    } else if (transaction.paymentMode === "bank") {
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank:</span>
            <span>{details.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Holder:</span>
            <span>{details.accountHolderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Number:</span>
            <span>{details.accountNumber.slice(0, 4) + '****' + details.accountNumber.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IFSC:</span>
            <span>{details.ifscCode}</span>
          </div>
          {details.transactionId && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span>{details.transactionId}</span>
            </div>
          )}
        </div>
      );
    } else if (transaction.paymentMode === "cash") {
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Admin Name:</span>
            <span>{details.adminName}</span>
          </div>
          {details.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>{details.location}</span>
            </div>
          )}
        </div>
      );
    }
    
    return <p>Unknown payment mode</p>;
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {displayIcon} {displayTitle} Details
          </DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="text-xl font-semibold">{formatAmount(transaction.amount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <StatusBadge status={transaction.status} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Mode:</span>
            <span className="capitalize">{transaction.paymentMode}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Payment Details</h4>
            {renderPaymentDetails()}
          </div>
          
          {transaction.adminNote && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Admin Note</h4>
                <p className="text-sm bg-muted p-2 rounded">{transaction.adminNote}</p>
              </div>
            </>
          )}
          
          {transaction.status === "pending" && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                This transaction is pending verification by an admin. You'll be notified once it's processed.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("deposit");
  
  // Form states for deposit and withdrawal
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("upi");
  const [formData, setFormData] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Define types for our data
  type Deposit = {
    id: number;
    userId: number;
    amount: number;
    paymentMode: string;
    status: string;
    details: any;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
  };
  
  type Withdrawal = {
    id: number;
    userId: number;
    amount: number;
    paymentMode: string;
    status: string;
    details: any;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
  };
  
  type Bet = {
    id: number;
    userId: number;
    gameType: string;
    betAmount: number;
    selection: string;
    result: string;
    payout: number;
    isWin: boolean;
    createdAt: string;
    market?: string;
    betType?: string;
  };
  
  // Fetch deposits
  const { 
    data: deposits = [] as Deposit[], 
    isLoading: isLoadingDeposits 
  } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch withdrawals
  const { 
    data: withdrawals = [] as Withdrawal[], 
    isLoading: isLoadingWithdrawals 
  } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Fetch bet history
  const { 
    data: bets = [] as Bet[], 
    isLoading: isLoadingBets 
  } = useQuery<Bet[]>({
    queryKey: ["/api/user/bets"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Create deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const res = await apiRequest("POST", "/api/deposits", depositData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit request created",
        description: "Your deposit request has been submitted for verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      
      // Reset form
      setAmount("");
      setPaymentMode("upi");
      setFormData({});
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Deposit request failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Create withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const res = await apiRequest("POST", "/api/withdrawals", withdrawalData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request created",
        description: "Your withdrawal request has been submitted for verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Reset form
      setAmount("");
      setPaymentMode("upi");
      setFormData({});
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal request failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Handle deposit/withdrawal form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form data based on payment mode
    if (paymentMode === "upi" && !formData.upiId) {
      toast({
        title: "Missing UPI ID",
        description: "Please enter your UPI ID.",
        variant: "destructive",
      });
      return;
    } else if (paymentMode === "bank" && (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName || !formData.bankName)) {
      toast({
        title: "Missing bank details",
        description: "Please fill all required bank details.",
        variant: "destructive",
      });
      return;
    } else if (paymentMode === "cash" && !formData.adminName) {
      toast({
        title: "Missing admin name",
        description: "Please enter admin name for cash payment.",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for API
    const transactionData = {
      amount: numAmount,
      paymentMode,
      details: formData
    };
    
    // Submit based on active tab
    if (activeTab === "deposit") {
      depositMutation.mutate(transactionData);
    } else {
      // Check if withdrawal amount is less than balance
      if (user && numAmount > user.balance) {
        toast({
          title: "Insufficient balance",
          description: "Your withdrawal amount exceeds your available balance.",
          variant: "destructive",
        });
        return;
      }
      
      withdrawalMutation.mutate(transactionData);
    }
  };
  
  // Render form based on payment mode
  const renderPaymentForm = () => {
    switch (paymentMode) {
      case "upi":
        return <UpiForm formData={formData} setFormData={setFormData} />;
      case "bank":
        return <BankForm formData={formData} setFormData={setFormData} />;
      case "cash":
        return <CashForm formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };
  
  // Format bet type for display
  const formatBetType = (betType?: string, gameType?: string) => {
    if (gameType === "coin_toss") return "Coin Toss";
    
    if (!betType) return "Satta Matka";
    
    const typeMap: Record<string, string> = {
      "jodi": "Jodi",
      "oddEven": "Odd/Even",
      "cross": "Cross",
      "hurf": "Hurf"
    };
    
    return typeMap[betType] || betType;
  };
  
  // Format market name for display
  const formatMarketName = (market?: string) => {
    if (!market) return "";
    
    const marketMap: Record<string, string> = {
      "gali": "Gali",
      "dishawar": "Dishawar",
      "mumbai": "Mumbai"
    };
    
    return marketMap[market] || market;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Wallet className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>
        
        {/* User Balance Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Your Balance</h2>
                <div className="text-3xl font-bold mt-1">
                  {user?.balance !== undefined ? formatAmount(user.balance) : "Loading..."}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Funds</DialogTitle>
                      <DialogDescription>
                        Deposit money to your account to start playing
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid w-full items-center gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                          <Input 
                            id="amount" 
                            type="number" 
                            className="pl-7" 
                            placeholder="1000" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid w-full items-center gap-2">
                        <Label htmlFor="paymentMode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as PaymentMode)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {renderPaymentForm()}
                      
                      <DialogFooter>
                        <Button type="submit" disabled={depositMutation.isPending}>
                          {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>
                        Withdraw money from your account
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid w-full items-center gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                          <Input 
                            id="amount" 
                            type="number" 
                            className="pl-7" 
                            placeholder="1000" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Available balance: {formatAmount(user?.balance || 0)}</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-2">
                        <Label htmlFor="paymentMode">Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as PaymentMode)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {renderPaymentForm()}
                      
                      <DialogFooter>
                        <Button type="submit" disabled={withdrawalMutation.isPending}>
                          {withdrawalMutation.isPending ? "Processing..." : "Withdraw Funds"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Transactions tabs and content */}
        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="bets">Bets History</TabsTrigger>
          </TabsList>
          
          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Deposit History</CardTitle>
                <CardDescription>Track your deposit requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDeposits ? (
                  <div className="py-8 text-center text-muted-foreground">Loading deposits...</div>
                ) : deposits.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="mb-2">
                      <CircleDollarSign className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p>No deposit requests found</p>
                    <p className="text-sm">Make your first deposit to start playing</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Your recent deposit requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((deposit: Deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>{formatTimeAgo(deposit.createdAt)}</TableCell>
                          <TableCell>{formatAmount(deposit.amount)}</TableCell>
                          <TableCell className="capitalize">{deposit.paymentMode}</TableCell>
                          <TableCell>
                            <StatusBadge status={deposit.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <TransactionDetailDialog transaction={deposit} type="deposit" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Track your withdrawal requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingWithdrawals ? (
                  <div className="py-8 text-center text-muted-foreground">Loading withdrawals...</div>
                ) : withdrawals.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="mb-2">
                      <ArrowUpFromLine className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p>No withdrawal requests found</p>
                    <p className="text-sm">Win some games first!</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Your recent withdrawal requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal: Withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{formatTimeAgo(withdrawal.createdAt)}</TableCell>
                          <TableCell>{formatAmount(withdrawal.amount)}</TableCell>
                          <TableCell className="capitalize">{withdrawal.paymentMode}</TableCell>
                          <TableCell>
                            <StatusBadge status={withdrawal.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <TransactionDetailDialog transaction={withdrawal} type="withdrawal" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bets History Tab */}
          <TabsContent value="bets">
            <Card>
              <CardHeader>
                <CardTitle>Betting History</CardTitle>
                <CardDescription>Review your game plays and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBets ? (
                  <div className="py-8 text-center text-muted-foreground">Loading bet history...</div>
                ) : bets.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="mb-2">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p>No bets found</p>
                    <p className="text-sm">Start playing to see your history</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>Your recent betting activity</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Bet</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Payout</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bets.map((bet: Bet) => (
                        <TableRow key={bet.id}>
                          <TableCell>{formatTimeAgo(bet.createdAt)}</TableCell>
                          <TableCell>
                            {bet.gameType === "satta_matka" ? (
                              <div>
                                <span>Satta Matka</span>
                                {bet.market && (
                                  <Badge variant="outline" className="ml-2">
                                    {formatMarketName(bet.market)}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              "Coin Toss"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatBetType(bet.betType, bet.gameType)}</span>
                              <span className="text-xs text-muted-foreground">
                                {bet.selection}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatAmount(bet.betAmount)}</TableCell>
                          <TableCell>
                            <span className="text-sm">{bet.result}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={bet.isWin ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {bet.isWin ? "+" : "-"}{formatAmount(Math.abs(bet.payout))}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}