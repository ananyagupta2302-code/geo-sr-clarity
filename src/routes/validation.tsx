import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GeoAppShell } from "@/components/geo-app-shell";
import { ValidationPanel, ReportModal } from "@/components/geo-dashboard";

export const Route = createFileRoute("/validation")({
  head: () => ({ meta: [
    { title: "Validation | GeoSR Intelligence" },
    { name: "description", content: "Review super-resolution imagery against a high-resolution reference and inspect quality scores." },
    { property: "og:title", content: "Validation | GeoSR Intelligence" },
    { property: "og:description", content: "Review super-resolution imagery against a high-resolution reference and inspect quality scores." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ValidationPage,
});
function ValidationPage() {
  const [open, setOpen] = useState(false);
  return <GeoAppShell active="Validation"><main className="dashboard-content destination-page"><h1>Validation</h1><ValidationPanel onReport={() => setOpen(true)} /><ReportModal open={open} onOpenChange={setOpen} model="ESRGAN" /></main></GeoAppShell>;
}