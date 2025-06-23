import React, { useEffect } from "react";
import { Button } from "./ui/button";

export function OnboardingModal({
  open,
  onClose,
  onOpenBYOK,
}: {
  open: boolean;
  onClose: () => void;
  onOpenBYOK: () => void;
}) {
  useEffect(() => {
    if (open) {
      localStorage.setItem("onboarding_shown", "true");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-md relative animate-in fade-in zoom-in">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2">Welcome to Flow3.chat!</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>Your API keys are encrypted</strong> before being saved to our
          database. Only you can decrypt and use them. We never store your raw
          keys or share them with anyone.
        </p>
        <ol className="mb-4 text-sm list-decimal list-inside space-y-1">
          <li>Click the button below to add your own API key (BYOK).</li>
          <li>Choose your preferred provider and paste your key.</li>
          <li>Start chatting with your favorite models!</li>
        </ol>
        <Button
          className="w-full mb-2"
          onClick={() => {
            onOpenBYOK();
            onClose();
          }}
        >
          Add API Key
        </Button>
        <Button className="w-full" variant="outline" onClick={onClose}>
          Maybe later
        </Button>
      </div>
    </div>
  );
}
