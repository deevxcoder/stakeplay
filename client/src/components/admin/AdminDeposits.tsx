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
  ArrowUpDown, 
  Search,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import type { Deposit } from "@shared/schema";

export default function AdminDeposits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState<"approved" | "rejected" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all deposits
  const { data: deposits = [], isLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/admin/deposits"],
    retry: false,
  });
  
  // Update deposit status mutation
  const updateDepositMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminNote 
    }: { 
      id: number; 
      status: string; 
      adminNote: string 
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/deposits/${id}`, { 
        status, 
        adminNote 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Deposit updated",
        description: `Deposit request has been ${actionStatus}.`,
      });
      setIsDetailsDialogOpen(false);
      setSelectedDeposit(null);
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
  
  // Handle deposit action (approve/reject)
  const handleDepositAction = (status: "approved" | "rejected") => {
    if (selectedDeposit) {
      updateDepositMutation.mutate({
        id: selectedDeposit.id,
        status,
        adminNote,
      });
    }
  };
  
  // Filter deposits
  const filteredDeposits = deposits.filter((deposit) => {
    // Filter by search term
    const matchesSearch = 
      deposit.id.toString().includes(searchTerm) ||
      deposit.userId.toString().includes(searchTerm) ||
      deposit.amount.toString().includes(searchTerm) ||
      deposit.paymentMode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = !statusFilter || deposit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort deposits by date (newest first)
  const sortedDeposits = [...filteredDeposits].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Group by status
  const pendingDeposits = sortedDeposits.filter(d => d.status === "pending");
  const approvedDeposits = sortedDeposits.filter(d => d.status === "approved");
  const rejectedDeposits = sortedDeposits.filter(d => d.status === "rejected");
  
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
  
  const renderPaymentDetails = (deposit: Deposit) => {
    if (!deposit.details) return <span className="text-gray-500">No details provided</span>;
    
    try {
      const details = typeof deposit.details === 'string' 
        ? JSON.parse(deposit.details) 
        : deposit.details;
      
      if (deposit.paymentMode === "upi") {
        return (
          <div>
            <p><span className="font-semibold">UPI ID:</span> {details.upiId}</p>
            <p><span className="font-semibold">Reference:</span> {details.reference || "N/A"}</p>
          </div>
        );
      } else if (deposit.paymentMode === "bank") {
        return (
          <div>
            <p><span className="font-semibold">Bank:</span> {details.bankName}</p>
            <p><span className="font-semibold">Account:</span> {details.accountNumber}</p>
            <p><span className="font-semibold">IFSC:</span> {details.ifscCode}</p>
            <p><span className="font-semibold">Reference:</span> {details.reference || "N/A"}</p>
          </div>
        );
      } else if (deposit.paymentMode === "cash") {
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
  
  const viewDepositDetails = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsDetailsDialogOpen(true);
    setActionStatus(null);
    setAdminNote("");
  };
  
  const renderDepositTable = (deposits: Deposit[]) => (
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
          {deposits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No deposits found
              </TableCell>
            </TableRow>
          ) : (
            deposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell>{deposit.id}</TableCell>
                <TableCell>{deposit.userId}</TableCell>
                <TableCell>{formatAmount(deposit.amount)}</TableCell>
                <TableCell className="capitalize">{deposit.paymentMode}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deposit.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : deposit.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {deposit.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(deposit.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewDepositDetails(deposit)}
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
          <CardTitle>Deposit Management</CardTitle>
          <CardDescription>Process user deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search deposits..."
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
            <div className="text-center py-4">Loading deposits...</div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending <span className="ml-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">{pendingDeposits.length}</span>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved <span className="ml-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">{approvedDeposits.length}</span>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected <span className="ml-1 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">{rejectedDeposits.length}</span>
                </TabsTrigger>
                <TabsTrigger value="all">All Deposits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                {renderDepositTable(pendingDeposits)}
              </TabsContent>
              
              <TabsContent value="approved">
                {renderDepositTable(approvedDeposits)}
              </TabsContent>
              
              <TabsContent value="rejected">
                {renderDepositTable(rejectedDeposits)}
              </TabsContent>
              
              <TabsContent value="all">
                {renderDepositTable(sortedDeposits)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Deposit Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Deposit Request Details</DialogTitle>
            <DialogDescription>
              Review and process this deposit request
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Deposit ID</p>
                  <p className="font-medium">{selectedDeposit.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium">{selectedDeposit.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">{formatAmount(selectedDeposit.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{selectedDeposit.paymentMode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDeposit.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedDeposit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedDeposit.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedDeposit.createdAt)}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Payment Details</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                  {renderPaymentDetails(selectedDeposit)}
                </div>
              </div>
              
              {selectedDeposit.adminNote && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Admin Note</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                    {selectedDeposit.adminNote}
                  </div>
                </div>
              )}
              
              {selectedDeposit.status === "pending" && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="admin-note">Admin Note</Label>
                    <Textarea
                      id="admin-note"
                      placeholder="Optional note about this deposit request"
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
                            ? `Are you sure you want to approve this deposit of ${formatAmount(selectedDeposit.amount)}? The user's balance will be updated.`
                            : `Are you sure you want to reject this deposit of ${formatAmount(selectedDeposit.amount)}?`}
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
                            onClick={() => handleDepositAction(actionStatus)}
                            disabled={updateDepositMutation.isPending}
                          >
                            {updateDepositMutation.isPending 
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