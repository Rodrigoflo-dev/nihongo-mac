import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./theme-provider";
import { queryClient } from "@/lib/query";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
