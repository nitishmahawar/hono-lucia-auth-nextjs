import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types/auth";

// Define the shape of our context
interface SessionContextType {
  session?: {
    expiresAt: string;
    user: User;
  };
  status: "loading" | "authenticated" | "unauthenticated";
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["session"],
    queryFn: api.auth.profile,
  });

  let status: "loading" | "authenticated" | "unauthenticated";
  if (isLoading) {
    status = "loading";
  } else if (isError || !data?.session) {
    status = "unauthenticated";
  } else {
    status = "authenticated";
  }

  const value: SessionContextType = {
    session: data
      ? { expiresAt: data.session.expiresAt, user: data.user }
      : undefined,
    status: status,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
