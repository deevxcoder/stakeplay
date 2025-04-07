import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronRight, 
  DollarSign,
  Badge,
  Clock,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminDeposits from "@/components/admin/AdminDeposits";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
import AdminMarketManagement from "@/components/admin/AdminMarketManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Admin check is now handled by AdminProtectedRoute component
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center">
            <Badge className="h-5 w-5 mr-2 text-primary" />
            <span>Admin Panel</span>
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 w-full">
              <TabsTrigger 
                value="overview" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </TabsTrigger>
              
              <TabsTrigger 
                value="users" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-5 w-5 mr-3" />
                User Management
              </TabsTrigger>
              
              <TabsTrigger 
                value="deposits" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("deposits")}
              >
                <DollarSign className="h-5 w-5 mr-3" />
                Deposits
              </TabsTrigger>
              
              <TabsTrigger 
                value="withdrawals" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("withdrawals")}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Withdrawals
              </TabsTrigger>
              
              <TabsTrigger 
                value="markets" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("markets")}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Market Management
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="justify-start w-full data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </TabsTrigger>
            </TabsList>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 h-16">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Button>
          
          <Button 
            variant={activeTab === "users" ? "default" : "ghost"} 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Users</span>
          </Button>
          
          <Button 
            variant={activeTab === "deposits" ? "default" : "ghost"} 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => setActiveTab("deposits")}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs mt-1">Deposits</span>
          </Button>
          
          <Button 
            variant={activeTab === "withdrawals" ? "default" : "ghost"} 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => setActiveTab("withdrawals")}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Withdraw</span>
          </Button>
          
          <Button 
            variant={activeTab === "markets" ? "default" : "ghost"} 
            className="flex flex-col items-center justify-center rounded-none h-full"
            onClick={() => setActiveTab("markets")}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Markets</span>
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "deposits" && "Deposit Requests"}
                {activeTab === "withdrawals" && "Withdrawal Requests"}
                {activeTab === "markets" && "Market Management"}
                {activeTab === "settings" && "Admin Settings"}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Link href="/">
                  <a className="hover:text-gray-700 dark:hover:text-gray-300">Home</a>
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>Admin</span>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-900 dark:text-gray-100">
                  {activeTab === "overview" && "Dashboard"}
                  {activeTab === "users" && "Users"}
                  {activeTab === "deposits" && "Deposits"}
                  {activeTab === "withdrawals" && "Withdrawals"}
                  {activeTab === "markets" && "Markets"}
                  {activeTab === "settings" && "Settings"}
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate("/")}
              >
                View Site
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="overview" className="mt-0">
                <AdminOverview />
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <AdminUserManagement />
              </TabsContent>
              
              <TabsContent value="deposits" className="mt-0">
                <AdminDeposits />
              </TabsContent>
              
              <TabsContent value="withdrawals" className="mt-0">
                <AdminWithdrawals />
              </TabsContent>
              
              <TabsContent value="markets" className="mt-0">
                <AdminMarketManagement />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <AdminSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}