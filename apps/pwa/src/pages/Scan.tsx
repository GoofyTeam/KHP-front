import { Button } from "@workspace/ui/components/button";
import { useEffect, useState } from "react";
import "react-barcode-scanner/polyfill";

import {
  BarcodeFormat,
  BarcodeScanner,
  DetectedBarcode,
  ScanOptions,
  useTorch,
} from "react-barcode-scanner";
import {
  ArrowLeft,
  CloudAlert,
  Flashlight,
  FlashlightOff,
  NotebookPen,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useNetworkState } from "@uidotdev/usehooks";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import z from "zod";
import { Label } from "@workspace/ui/components/label";

const portraitConstraints = {
  width: { min: 480, ideal: 720 },
  height: { min: 640, ideal: 1280 },
  facingMode: { ideal: "environment" },
};

const scanOptions: ScanOptions = {
  formats: [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ],
  delay: 1000,
};

export const scanModeEnum = z.enum([
  "stock-mode",
  "search-mode",
  "remove-mode",
]);
type ScanModeType = z.infer<typeof scanModeEnum>;

export default function ScanPage() {
  const navigate = useNavigate();
  const { online } = useNetworkState();
  const { scanType: type } = useParams({
    from: "/_protected/scan/$scanType",
  });
  const { isTorchSupported, isTorchOn, setIsTorchOn } = useTorch();

  const [scanMode, setScanMode] = useState<ScanModeType>("stock-mode");

  const onScan = (value: DetectedBarcode[]) => {
    if (value.length <= 0) return;

    const barcode = value[0].rawValue;

    navigate({
      to: "/handle-item",
      search: {
        mode: "barcode",
        type: scanMode === "remove-mode" ? "remove-quantity" : type,
        barcode,
        scanMode,
      },
    });
  };

  useEffect(() => {
    // Verrouillage dynamique de l’orientation
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };

    if (orientation.lock) {
      orientation.lock("portrait-primary").catch(() => {
        console.warn("Impossible de verrouiller l'orientation.");
      });
    }
  }, []);

  const onTorchSwitch = () => setIsTorchOn(!isTorchOn);

  if (!online) {
    return (
      <div className="fixed inset-0 z-0 bg-gray-100">
        <div className="w-full h-full bg-gray-300" />

        <div className="absolute inset-0 pointer-events-none flex">
          <div className="mx-auto my-auto w-[80vw] h-[15svh] border-4 border-khp-primary rounded-lg flex flex-col items-center justify-center">
            <p className="text-xl font-semibold text-khp-primary">
              No internet connection
            </p>
            <CloudAlert size={48} className="text-khp-primary" />
          </div>

          <Button
            variant="khp-default"
            className="absolute top-4 left-4 w-14 h-14 pointer-events-auto"
            onClick={() => navigate({ to: "/inventory" })}
          >
            <ArrowLeft strokeWidth={2} className="text-white !h-7 !w-7" />
          </Button>
          <Button
            variant="khp-default"
            size="xl"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            onClick={() => {
              navigate({
                to: "/handle-item",
                search: {
                  mode: "manual",
                  type,
                  scanMode,
                },
              });
            }}
          >
            <NotebookPen
              strokeWidth={2}
              className="text-white !h-7 !w-7 mr-2"
            />
            <span className="text-xl">Manual mode</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 [&_video]:w-full [&_video]:h-full [&_video]:object-scale-down">
      <BarcodeScanner
        trackConstraints={portraitConstraints}
        options={scanOptions}
        onCapture={onScan}
      />
      <div className="absolute inset-0 pointer-events-none flex">
        <div className="mx-auto my-auto w-[80vw] h-[15svh] border-4 border-khp-primary rounded-lg"></div>
        {isTorchSupported && (
          <button
            onClick={onTorchSwitch}
            className="absolute top-4 right-4 w-14 h-14 pointer-events-auto"
          >
            {isTorchOn ? (
              <Flashlight strokeWidth={2} className="text-white !h-7 !w-7" />
            ) : (
              <FlashlightOff strokeWidth={2} className="text-white !h-7 !w-7" />
            )}
          </button>
        )}
        <Button
          variant="khp-default"
          className="absolute top-4 left-4 w-14 h-14 pointer-events-auto"
          onClick={() => {
            navigate({ to: "/inventory" });
          }}
        >
          <ArrowLeft strokeWidth={2} className="text-white !h-7 !w-7" />
        </Button>

        {(type === "add-product" || type === "add-quantity") && (
          <div className="absolute top-15 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <div className="mb-2 flex flex-col items-center">
              <Label className="text-white text-lg text-center">
                Scan mode:
              </Label>
            </div>
            <Tabs
              value={scanMode}
              onValueChange={(value) => {
                setScanMode(value as ScanModeType);
              }}
            >
              <TabsList variant="khp-default" autoHeight={true}>
                <TabsTrigger
                  value="stock-mode"
                  variant="khp-default"
                  size="xxl"
                >
                  ADD
                </TabsTrigger>
                <TabsTrigger
                  value="remove-mode"
                  variant="khp-default"
                  size="xxl"
                >
                  REMOVE
                </TabsTrigger>
                <TabsTrigger
                  value="search-mode"
                  variant="khp-default"
                  size="xxl"
                >
                  SEARCH
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <Button
          variant="khp-default"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto"
          size="xl"
          onClick={() => {
            navigate({
              to: "/handle-item",
              search: {
                mode: "manual",
                type,
                scanMode,
              },
            });
          }}
        >
          <NotebookPen strokeWidth={2} className="text-white !h-7 !w-7" />{" "}
          <span className="text-xl">Add Manually</span>
        </Button>
      </div>
    </div>
  );
}
