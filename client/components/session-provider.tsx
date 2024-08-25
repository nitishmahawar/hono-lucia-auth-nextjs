import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/router";

// Define the shape of our session object
interface Session {
  user: {
    id: string;
    email: string;
    // Add any other user properties you need
  } | null;
  // Add any other session properties you need
}

// Define the shape of our context
interface SessionContextType {
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch the session from your Hono backend
  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include", // Important for including cookies
      });
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the session when the component mounts
  useEffect(() => {
    fetchSession();
  }, []);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, []);

  const value = {
    session,
    loading,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
