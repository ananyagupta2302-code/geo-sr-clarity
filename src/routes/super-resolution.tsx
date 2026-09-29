import { createFileRoute } from "@tanstack/react-router";
import { SuperResolutionPage } from "@/components/super-resolution-page";

export const Route = createFileRoute("/super-resolution")({
  head: () => ({ meta: [
    { title: "Super Resolution | GeoSR Intelligence" },
    { name: "description", content: "Enhance Sentinel-2 satellite imagery with AI super resolution and inspect output, quality metrics, and validation workflow." },
    { property: "og:title", content: "Super Resolution | GeoSR Intelligence" },
    { property: "og:description", content: "Enhance Sentinel-2 satellite imagery with AI super resolution and inspect output, quality metrics, and validation workflow." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SuperResolutionPage,
});