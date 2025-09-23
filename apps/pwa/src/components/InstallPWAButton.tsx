import { Button } from "@workspace/ui/components/button";
import { useEffect, useState } from "react";

// Not yet in TS libdom. Define a minimal type we need.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPWAButton({
  className = "hover:opacity-90 active:opacity-80",
  label = "Install the app",
  onInstalled,
  onVisibilityChange,
}: {
  className?: string;
  label?: string;
  onInstalled?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Some browsers (iOS Safari) never fire this event
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
      onVisibilityChange?.(true);
    };

    const onInstalledHandler = () => {
      setVisible(false);
      setDeferred(null);
      onInstalled?.();
      onVisibilityChange?.(false);
    };

    window.addEventListener("beforeinstallprompt", onBip as EventListener);
    window.addEventListener("appinstalled", onInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip as EventListener);
      window.removeEventListener("appinstalled", onInstalledHandler);
    };
  }, [onInstalled, onVisibilityChange]);

  if (!visible) return null;

  return (
    <Button
      className={className}
      variant="khp-default"
      onClick={async () => {
        if (!deferred) return;
        // Show install prompt
        await deferred.prompt();
        try {
          const { outcome } = await deferred.userChoice;
          // Hide after user acts either way to avoid nagging
          setVisible(false);
          setDeferred(null);
          onVisibilityChange?.(false);
          if (outcome === "accepted") onInstalled?.();
        } catch {
          setVisible(false);
          setDeferred(null);
          onVisibilityChange?.(false);
        }
      }}
    >
      {label}
    </Button>
  );
}

export default InstallPWAButton;
