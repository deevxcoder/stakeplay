import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Search,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import type { Withdrawal } from "@shared/schema";

export default function AdminWithdrawals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all withdrawals
  const { data: withdrawals = [], isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
    retry: false,
  });
  
  // Update withdrawal status mutation
  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminNote 
    }: { 
      id: number; 
      status: string; 
      adminNote: string 
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/withdrawals/${id}`, { 
        status, 
        adminNote 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Withdrawal updated",
        description: `Withdrawal request has been ${actionStatus}.`,
      });
      setIsDetailsDialogOpen(false);
      setSelectedWithdrawal(null);
      setActionStatus(null);
      setAdminNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle withdrawal action (approve/reject)
  const handleWithdrawalAction = (status: "approved" | "rejected") => {
    if (selectedWithdrawal) {
      updateWithdrawalMutation.mutate({
        id: selectedWithdrawal.id,
        status,
        adminNote,
      });
    }
  };
  
  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    // Filter by search term
    const matchesSearch = 
      withdrawal.id.toString().includes(searchTerm) ||
      withdrawal.userId.toString().includes(searchTerm) ||
      withdrawal.amount.toString().includes(searchTerm) ||
      withdrawal.paymentMode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = !statusFilter || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort withdrawals by date (newest first)
  const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Group by status
  const pendingWithdrawals = sortedWithdrawals.filter(w => w.status === "pending");
  const approvedWithdrawals = sortedWithdrawals.filter(w => w.status === "approved");
  const rejectedWithdrawals = sortedWithdrawals.filter(w => w.status === "rejected");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy HH:mm");
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const renderPaymentDetails = (withdrawal: Withdrawal) => {
    if (!withdrawal.details) return <span className="text-gray-500">No details provided</span>;
    
    try {
      const details = typeof withdrawal.details === 'string' 
        ? JSON.parse(withdrawal.details) 
        : withdrawal.details;
      
      if (withdrawal.paymentMode === "upi") {
        return (
          <div>
            <p><span className="font-semibold">UPI ID:</span> {details.upiId}</p>
            <p><span className="font-semibold">Name:</span> {details.name || "N/A"}</p>
          </div>
        );
      } else if (withdrawal.paymentMode === "bank") {
        return (
          <div>
            <p><span className="font-semibold">Bank:</span> {details.bankName}</p>
            <p><span className="font-semibold">Account:</span> {details.accountNumber}</p>
            <p><span className="font-semibold">IFSC:</span> {details.ifscCode}</p>
            <p><span className="font-semibold">Account Holder:</span> {details.accountHolder || "N/A"}</p>
          </div>
        );
      } else if (withdrawal.paymentMode === "cash") {
        return (
          <div>
            <p><span className="font-semibold">Name:</span> {details.name}</p>
            <p><span className="font-semibold">Mobile:</span> {details.mobile}</p>
            <p><span className="font-semibold">Location:</span> {details.location || "N/A"}</p>
          </div>
        );
      }
    } catch (e) {
      return <span className="text-red-500">Invalid details format</span>;
    }
    
    return <span className="text-gray-500">Unknown payment mode</span>;
  };
  
  const viewWithdrawalDetails = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailsDialogOpen(true);
    setActionStatus(null);
    setAdminNote("");
  };
  
  const renderWithdrawalTable = (withdrawals: Withdrawal[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No withdrawals found
              </TableCell>
            </TableRow>
          ) : (
            withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{withdrawal.id}</TableCell>
                <TableCell>{withdrawal.userId}</TableCell>
                <TableCell>{formatAmount(withdrawal.amount)}</TableCell>
                <TableCell className="capitalize">{withdrawal.paymentMode}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      withdrawal.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : withdrawal.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {withdrawal.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewWithdrawalDetails(withdrawal)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Management</CardTitle>
          <CardDescription>Process user withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search withdrawals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading withdrawals...</div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending <span className="ml-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">{pendingWithdrawals.length}</span>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved <span className="ml-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">{approvedWithdrawals.length}</span>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected <span className="ml-1 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">{rejectedWithdrawals.length}</span>
                </TabsTrigger>
                <TabsTrigger value="all">All Withdrawals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                {renderWithdrawalTable(pendingWithdrawals)}
              </TabsContent>
              
              <TabsContent value="approved">
                {renderWithdrawalTable(approvedWithdrawals)}
              </TabsContent>
              
              <TabsContent value="rejected">
                {renderWithdrawalTable(rejectedWithdrawals)}
              </TabsContent>
              
              <TabsContent value="all">
                {renderWithdrawalTable(sortedWithdrawals)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Withdrawal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Withdrawal ID</p>
                  <p className="font-medium">{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{selectedWithdrawal.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">{formatAmount(selectedWithdrawal.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedWithdrawal.paymentMode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedWithdrawal.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedWithdrawal.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedWithdrawal.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedWithdrawal.createdAt)}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Payment Details</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                  {renderPaymentDetails(selectedWithdrawal)}
                </div>
              </div>
              
              {selectedWithdrawal.adminNote && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Admin Note</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                    {selectedWithdrawal.adminNote}
                  </div>
                </div>
              )}
              
              {selectedWithdrawal.status === "pending" && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="admin-note">Admin Note</Label>
                    <Textarea
                      id="admin-note"
                      placeholder="Optional note about this withdrawal request"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setActionStatus("rejected")}
                    >
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setActionStatus("approved")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                  
                  {actionStatus && (
                    <div className="mt-4">
                      <div className={`p-3 rounded-md ${
                        actionStatus === "approved" 
                          ? "bg-green-50 text-green-800 border border-green-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        <p className="font-medium">
                          {actionStatus === "approved" 
                            ? "Confirm Approval" 
                            : "Confirm Rejection"}
                        </p>
                        <p className="text-sm mt-1">
                          {actionStatus === "approved"
                            ? `Are you sure you want to approve this withdrawal of ${formatAmount(selectedWithdrawal.amount)}?`
                            : `Are you sure you want to reject this withdrawal of ${formatAmount(selectedWithdrawal.amount)}? The user's balance will be restored.`}
                        </p>
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActionStatus(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant={actionStatus === "approved" ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleWithdrawalAction(actionStatus)}
                            disabled={updateWithdrawalMutation.isPending}
                          >
                            {updateWithdrawalMutation.isPending 
                              ? "Processing..." 
                              : `Yes, ${actionStatus === "approved" ? "Approve" : "Reject"}`}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}