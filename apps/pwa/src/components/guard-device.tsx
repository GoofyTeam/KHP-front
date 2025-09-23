import { useMediaQuery } from "@uidotdev/usehooks";
import { ReactNode } from "react";

export function Guard({
  isProd = true,
  children,
}: {
  isProd?: boolean;
  children: ReactNode;
}) {
  const hoverNoneAndPointerCoarse = useMediaQuery(
    "(hover: none) and (pointer: coarse)",
  );
  const anyHoverNoneAndAnyPointerCoarse = useMediaQuery(
    "(any-hover: none) and (any-pointer: coarse)",
  );

  const isTouch =
    hoverNoneAndPointerCoarse ||
    anyHoverNoneAndAnyPointerCoarse ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

  const isWide = useMediaQuery("(min-width: 64em)");

  const isLandscape = useMediaQuery("(orientation: landscape)");

  const displayMode = useMediaQuery("(display-mode: standalone)");
  const screenDisplayMode = useMediaQuery(
    "screen and (display-mode: standalone)",
  );

  const isStandalone = displayMode || screenDisplayMode;

  const isDesktop = isWide && !isTouch;

  if (isProd && isDesktop && !isStandalone) {
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100 p-6 text-center text-khp-primary">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          This application is optimized for mobile and tablet devices
        </h1>
        <p className="mb-2 text-sm text-gray-600">
          Open it on your mobile/tablet (scan the QR below).
        </p>
        {currentUrl ? (
          <img
            className="rounded bg-white p-2 shadow"
            width={180}
            height={180}
            alt="QR to open the app on mobile or tablet"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              currentUrl,
            )}`}
          />
        ) : null}
      </div>
    );
  }

  if (isProd && isTouch && isLandscape) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100 p-6 text-center text-khp-primary">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Please rotate your device to portrait mode
        </h1>
        <p className="max-w-md text-gray-700">
          This application is best viewed in portrait orientation for an optimal
          experience.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          If you are already in portrait mode and on a mobile or tablet device,
          please install the app to your home screen for the best experience.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
