import { createFileRoute } from "@tanstack/react-router";
import { ImageryLibrary } from "@/components/imagery-library";

export const Route = createFileRoute("/imagery")({
  head: () => ({ meta: [
    { title: "Imagery Library | GeoSR Intelligence" },
    { name: "description", content: "Browse and inspect satellite scenes, areas of interest, spectral bands and image quality in the GeoSR Intelligence Imagery Library." },
    { property: "og:title", content: "Imagery Library | GeoSR Intelligence" },
    { property: "og:description", content: "Browse and inspect satellite scenes, areas of interest, spectral bands and image quality in the GeoSR Intelligence Imagery Library." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ImageryLibrary,
});
