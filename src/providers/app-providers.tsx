import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./theme-provider";
import { UiScaleProvider } from "./ui-scale";
import { AccentProvider } from "./accent";
import { CosmeticsProvider } from "./cosmetics";
import { queryClient } from "@/lib/query";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <UiScaleProvider>
        <AccentProvider>
          <CosmeticsProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </CosmeticsProvider>
        </AccentProvider>
      </UiScaleProvider>
    </ThemeProvider>
  );
}
