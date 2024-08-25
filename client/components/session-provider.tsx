import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types/auth";

// Define the shape of our context
interface SessionContextType {
  session?: {
    expiresAt?: string;
    fresh?: boolean;
    id?: string;
    userId?: string;
    user?: User;
  };
  loading: boolean;
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// Define props for SessionProvider
interface SessionProviderProps {
  children: React.ReactNode;
}

// SessionProvider component
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: api.auth.profile,
  });

  const value = {
    session: { ...data?.session, user: data?.user },
    loading: isLoading,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
