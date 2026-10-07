import { createFileRoute } from "@tanstack/react-router";
import { AnalysisPage } from "@/components/analysis-page";

export const Route = createFileRoute("/analysis")({
  head: () => ({ meta: [
    { title: "Analysis | GeoSR Intelligence" },
    { name: "description", content: "Explore insights, land cover classification, change detection, spectral analysis and uncertainty metrics from enhanced satellite imagery in GeoSR Intelligence." },
    { property: "og:title", content: "Analysis | GeoSR Intelligence" },
    { property: "og:description", content: "Explore insights, land cover classification, change detection, spectral analysis and uncertainty metrics from enhanced satellite imagery in GeoSR Intelligence." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AnalysisPage,
});
