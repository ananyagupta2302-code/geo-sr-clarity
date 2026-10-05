import { createFileRoute } from "@tanstack/react-router";
import { CompareImageryPage } from "@/components/compare-imagery-page";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Compare Results | GeoSR Intelligence" },
    { name: "description", content: "Compare Sentinel-2 input imagery against enhanced super-resolution output for Kanpur." },
    { property: "og:title", content: "Compare Results | GeoSR Intelligence" },
    { property: "og:description", content: "Compare Sentinel-2 input imagery against enhanced super-resolution output for Kanpur." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CompareImageryPage,
});