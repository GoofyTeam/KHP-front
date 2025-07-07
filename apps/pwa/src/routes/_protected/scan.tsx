import { createFileRoute } from "@tanstack/react-router";
import ScanPage from "../../pages/Scan";

export const Route = createFileRoute("/_protected/scan")({
  component: ScanPage,
});
