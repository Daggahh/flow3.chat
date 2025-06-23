"use client";

import React, { useEffect, useState } from "react";
import { OnboardingModal } from "./OnboardingModal";
import { BYOKModal } from "./BYOKModal";

export function OnboardingHandler({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBYOK, setShowBYOK] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("onboarding_shown")
    ) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onOpenBYOK={() => {
            setShowOnboarding(false);
            setShowBYOK(true);
          }}
        />
      )}
      {showBYOK && (
        <BYOKModal isOpen={showBYOK} onClose={() => setShowBYOK(false)} />
      )}
      {children}
    </>
  );
}
