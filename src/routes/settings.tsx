import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/settings-page";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings | GeoSR Intelligence" },
    { name: "description", content: "Manage GeoSR Intelligence map, model, processing, notification, and application preferences." },
    { property: "og:title", content: "Settings | GeoSR Intelligence" },
    { property: "og:description", content: "Manage GeoSR Intelligence map, model, processing, notification, and application preferences." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SettingsPage,
});