import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Trophy, Wallet, BookOpen, Settings, Shield, LogOut, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    mobile: user?.mobile || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("PATCH", "/api/user/profile", profileData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditMode(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const res = await apiRequest("POST", "/api/user/change-password", passwordData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle profile update form submission
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      email: formData.email,
      mobile: formData.mobile
    });
  };
  
  // Handle password change form submission
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user?.username}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "No email provided"}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <nav className="space-y-2">
                  <Link href="/profile">
                    <a className="flex items-center p-2 rounded-md hover:bg-secondary w-full">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </a>
                  </Link>
                  <Link href="/wallet">
                    <a className="flex items-center p-2 rounded-md hover:bg-secondary w-full">
                      <Wallet className="h-4 w-4 mr-2" />
                      <span>Wallet</span>
                    </a>
                  </Link>
                  <Link href="/settings">
                    <a className="flex items-center p-2 rounded-md hover:bg-secondary w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center p-2 rounded-md hover:bg-secondary w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      Account Security
                    </span>
                    <span className="text-sm text-green-500">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Gaming Level
                    </span>
                    <span className="text-sm">{user?.balance ? "Beginner" : "New Player"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      Account Age
                    </span>
                    <span className="text-sm">New</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and contact information
                    </CardDescription>
                  </div>
                  
                  <Button 
                    variant={editMode ? "outline" : "secondary"}
                    onClick={() => {
                      if (editMode) {
                        setFormData({
                          ...formData,
                          email: user?.email || "",
                          mobile: user?.mobile || ""
                        });
                      }
                      setEditMode(!editMode);
                    }}
                  >
                    {editMode ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid w-full gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username"
                        value={user?.username} 
                        disabled 
                        className="bg-muted" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Username cannot be changed
                      </p>
                    </div>
                    
                    <div className="grid w-full gap-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          className="pl-10" 
                          placeholder="your@email.com" 
                          value={formData.email} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid w-full gap-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="mobile" 
                          name="mobile" 
                          type="tel" 
                          className="pl-10" 
                          placeholder="Your mobile number" 
                          value={formData.mobile} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Username</span>
                      <span>{user?.username}</span>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Email</span>
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user?.email || "Not provided"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Mobile Number</span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user?.mobile || "Not provided"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">Account Balance</span>
                      <span>₹{user?.balance?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword"
                      type="password" 
                      value={formData.currentPassword} 
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid w-full gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword"
                      type="password" 
                      value={formData.newPassword} 
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid w-full gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                  >
                    {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}