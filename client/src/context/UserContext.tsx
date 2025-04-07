import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  balance: number;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  updateBalance: (newBalance: number) => void;
  loginAsDemo: () => void;
  logout: () => void;
  isLoggingIn: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  updateBalance: () => {},
  loginAsDemo: () => {},
  logout: () => {},
  isLoggingIn: false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<User>({
    queryKey: ['/api/user'],
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 0,  // Don't retry on error
    enabled: localStorage.getItem('demoMode') === 'true'  // Only fetch if in demo mode
  });

  // Set the demo mode flag when component mounts
  useEffect(() => {
    if (localStorage.getItem('demoMode') === 'true') {
      refetch();
    }
  }, [refetch]);

  // Update user data whenever it changes
  useEffect(() => {
    if (data) {
      // Modify balance to 1000 coins for demo users
      if (localStorage.getItem('demoMode') === 'true' && data.balance > 10000) {
        setUser({
          ...data,
          balance: 1000
        });
      } else {
        setUser(data);
      }
    }
  }, [data]);

  // Login as demo user mutation
  const loginDemoMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would be an API call
      // But for our demo, we just fetch the user data
      localStorage.setItem('demoMode', 'true');
      const res = await refetch();
      return res.data as User;
    },
    onSuccess: (userData) => {
      if (userData) {
        // Set demo user with 1000 balance
        setUser({
          ...userData,
          balance: 1000
        });
        
        toast({
          title: "Demo Mode Activated",
          description: "You're now using a demo account with 1,000 coins!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not login to demo mode. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would be an API call
      localStorage.removeItem('demoMode');
      return true;
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: "Logged Out",
        description: "You have been logged out of demo mode.",
      });
    }
  });

  // Function to update the user balance
  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      });
    }
  };

  // Function to login as demo user
  const loginAsDemo = () => {
    loginDemoMutation.mutate();
  };

  // Function to logout
  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading: isLoading || loginDemoMutation.isPending, 
      updateBalance,
      loginAsDemo,
      logout,
      isLoggingIn: loginDemoMutation.isPending
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Fixed function export to be compatible with Fast Refresh
export function useUser() {
  return useContext(UserContext);
}
