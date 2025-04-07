import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  updateBalance: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<User>({
    queryKey: ['/api/user'],
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Update user data whenever it changes
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  // Function to update the user balance
  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({
        ...user,
        balance: newBalance,
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
