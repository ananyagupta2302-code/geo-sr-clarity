import { createFileRoute } from "@tanstack/react-router";
import { GeoAppShell } from "@/components/geo-app-shell";
import { BeforeAfterComparison } from "@/components/geo-dashboard";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Compare Results | GeoSR Intelligence" },
    { name: "description", content: "Compare Sentinel-2 input imagery against enhanced super-resolution output for Kanpur." },
    { property: "og:title", content: "Compare Results | GeoSR Intelligence" },
    { property: "og:description", content: "Compare Sentinel-2 input imagery against enhanced super-resolution output for Kanpur." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <GeoAppShell active="Compare"><main className="dashboard-content destination-page"><h1>Compare Results</h1><BeforeAfterComparison /></main></GeoAppShell>,
});