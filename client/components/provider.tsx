"use client";
import React, { FC, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import SessionProvider from "./session-provider";

interface ProviderProps {
  children: React.ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

export default Provider;
