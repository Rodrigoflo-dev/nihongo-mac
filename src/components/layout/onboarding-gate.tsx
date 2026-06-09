import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useUserProfile } from "@/hooks/use-user-profile";
import { LoadingScreen } from "@/components/visual/loading-screen";

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { data: profile, isLoading, isError } = useUserProfile();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen label="Preparando tu plan…" />;
  }

  if (isError) {
    return (
      <div className="grid h-screen place-items-center bg-background">
        <div className="text-center text-sm text-destructive">
          No se pudo cargar tu perfil. Cierra y vuelve a abrir la app.
        </div>
      </div>
    );
  }

  const onboarded = Boolean(profile?.onboardedAt);

  if (!onboarded && location.pathname !== "/welcome") {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}
