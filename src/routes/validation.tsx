import { createFileRoute } from "@tanstack/react-router";
import { ValidationPage } from "@/components/validation-page";

export const Route = createFileRoute("/validation")({
  head: () => ({ meta: [
    { title: "Validation & Scientific Fidelity | GeoSR Intelligence" },
    { name: "description", content: "Compare super-resolved satellite output, high-resolution reference imagery, and error maps with scientific fidelity metrics for Kanpur." },
    { property: "og:title", content: "Validation & Scientific Fidelity | GeoSR Intelligence" },
    { property: "og:description", content: "Compare super-resolved satellite output, high-resolution reference imagery, and error maps with scientific fidelity metrics for Kanpur." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ValidationPage,
});