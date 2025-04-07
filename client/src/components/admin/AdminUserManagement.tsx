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
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Ban, CheckCircle } from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    balance: 0,
    isActive: true,
    isAdmin: false,
    transactionType: null, // Added for transaction type
    amount: 0, // Added for transaction amount
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; isAdmin: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User created",
        description: "New user has been created successfully.",
      });
      setIsAddUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { id: number }) => {
      const { id, ...rest } = userData;
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, rest);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ban/Unban user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User status updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Status update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.mobile && user.mobile.includes(searchTerm))
  );

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email || "",
      mobile: user.mobile || "",
      balance: user.balance,
      isActive: user.isActive !== false,
      isAdmin: user.isAdmin === true,
      transactionType: null, //reset transaction type
      amount: 0, //reset amount
    });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { //updated type
    const { name, value, type } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      if(editFormData.transactionType){
        const updatedBalance = editFormData.transactionType === 'deposit' ? 
          editingUser.balance + editFormData.amount : editingUser.balance - editFormData.amount;

        editUserMutation.mutate({
          id: editingUser.id,
          ...editFormData,
          balance: updatedBalance,
        });
      } else {
        editUserMutation.mutate({
          id: editingUser.id,
          ...editFormData,
        });
      }
    }
  };

  const toggleUserStatus = (user: User) => {
    toggleUserStatusMutation.mutate({
      id: user.id,
      isActive: !(user.isActive),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              Add User
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>₹{user.balance}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive !== false ? "Active" : "Banned"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isAdmin
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        </TableCell>
                        <TableCell>{user.createdAt ? formatDate(user.createdAt) : "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={editFormData.username}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balance" className="text-right">
                  Balance
                </Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  value={editFormData.balance}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editFormData.isActive ? "active" : "banned"}
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={editFormData.isAdmin ? "admin" : "user"}
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      isAdmin: value === "admin",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transactionType" className="text-right">
                  Transaction Type
                </Label>
                <Select
                  name="transactionType"
                  value={editFormData.transactionType}
                  onValueChange={handleFormChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdraw">Withdraw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editFormData.transactionType ? (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      value={editFormData.amount}
                      onChange={handleFormChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editUserMutation.isPending}>
                    {editUserMutation.isPending ? "Processing..." : 
                     editFormData.transactionType === "deposit" ? "Deposit" : "Withdraw"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createUserMutation.mutate({
              username: formData.get("username") as string,
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              isAdmin: formData.get("isAdmin") === "true"
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isAdmin" className="text-right">
                  Role
                </Label>
                <Select name="isAdmin" defaultValue="false">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">User</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}