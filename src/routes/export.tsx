import { createFileRoute } from "@tanstack/react-router";
import { ExportPage } from "@/components/export-page";

export const Route = createFileRoute("/export")({
  head: () => ({ meta: [
    { title: "Export Results | GeoSR Intelligence" },
    { name: "description", content: "Configure and export GeoSR satellite imagery, validation reports, comparison packages, analysis results, and metadata." },
    { property: "og:title", content: "Export Results | GeoSR Intelligence" },
    { property: "og:description", content: "Configure and export GeoSR satellite imagery, validation reports, comparison packages, analysis results, and metadata." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ExportPage,
});
