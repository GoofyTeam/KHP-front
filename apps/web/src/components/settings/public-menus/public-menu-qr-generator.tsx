"use client";

import { Button } from "@workspace/ui/components/button";
import { buildPublicMenusBaseUrl } from "@workspace/ui/lib/public-menus";
import { generateQRCodeSync } from "@workspace/ui/lib/qr";
import { useRef } from "react";
import { Download, Printer, SquareArrowOutUpRight } from "lucide-react";

function PublicMenuQrGenerator({
  publicMenusSlug,
}: {
  publicMenusSlug?: string;
}) {
  const qrRef = useRef<HTMLImageElement>(null);
  if (!publicMenusSlug) return null;
  const currentOrigin = buildPublicMenusBaseUrl(window.location.origin);

  const qrSrc = generateQRCodeSync(`${currentOrigin}${publicMenusSlug}`, {
    colorDark: "#4CAF51",
    colorLight: "#FFFFFF",
    scale: 16,
    margin: 2,
  });

  const handlePrint = () => {
    if (!qrRef.current) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Print QR</title>
          <style>
            body { display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
            img { max-width:100%; height:auto; }
          </style>
        </head>
        <body>
          <img src="${qrRef.current.src}" alt="QR Code" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Public Menu QR Code
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Share your public menu easily with this QR code.
        </p>
      </div>

      <div className="p-6 flex flex-col items-center gap-y-6">
        <img
          src={qrSrc}
          alt="Public menu QR code"
          className="aspect-square max-w-lg w-full"
          ref={qrRef}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mt-4 flex-wrap justify-center">
          <Button variant="outline" asChild className="text-sm min-w-12">
            <a href={qrSrc} download="public-menu-qr.png">
              <Download />
              Download
            </a>
          </Button>
          <Button variant="khp-outline" asChild className="text-sm min-w-12">
            <a
              href={`${currentOrigin}${publicMenusSlug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SquareArrowOutUpRight />
              Visit
            </a>
          </Button>
          <Button
            variant="khp-outline"
            className="text-sm min-w-12"
            onClick={handlePrint}
          >
            <Printer />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PublicMenuQrGenerator;
