import InstallPWAButton from "./InstallPWAButton";
import { useEffect, useState } from "react";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  const mq = (q: string) => window.matchMedia && window.matchMedia(q).matches;
  const coarse =
    mq("(hover: none) and (pointer: coarse)") ||
    mq("(any-hover: none) and (any-pointer: coarse)");
  const maxPoints =
    typeof navigator !== "undefined" && (navigator as any).maxTouchPoints > 0;
  return coarse || maxPoints;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const mq = (q: string) => window.matchMedia && window.matchMedia(q).matches;
  const standalone =
    mq("(display-mode: standalone)") ||
    mq("screen and (display-mode: standalone)");
  // iOS
  const iosStandalone =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof navigator !== "undefined" && (navigator as any).standalone;
  return Boolean(standalone || iosStandalone);
}

export default function MobileInstallBanner() {
  const [touch, setTouch] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTouch(isTouchDevice());
    setStandalone(isStandaloneDisplay());
  }, []);

  if (!touch || standalone || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[rgba(76,175,80,0.25)] bg-white px-4 py-3 shadow-lg">
        <span className="text-sm text-slate-900 font-medium">
          Install KHP for better experience
        </span>
        <InstallPWAButton label="Install" onVisibilityChange={setVisible} />
      </div>
    </div>
  );
}
