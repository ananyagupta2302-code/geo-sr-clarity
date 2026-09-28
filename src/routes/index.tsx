import { createFileRoute } from "@tanstack/react-router";
import { GeoDashboard } from "@/components/geo-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "GeoSR Intelligence | Satellite Super Resolution Dashboard" },
    { name: "description", content: "Explore AI-enhanced satellite imagery, super-resolution processing, quality metrics, and geospatial validation in GeoSR Intelligence." },
    { property: "og:title", content: "GeoSR Intelligence | Satellite Super Resolution Dashboard" },
    { property: "og:description", content: "Explore AI-enhanced satellite imagery, super-resolution processing, quality metrics, and geospatial validation in GeoSR Intelligence." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GeoDashboard,
});
