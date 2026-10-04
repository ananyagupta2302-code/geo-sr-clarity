import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar, TopNavbar } from "@/components/geo-dashboard";

export function GeoAppShell({ active, children, subtitle }: { active: string; children: ReactNode; subtitle?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataset, setDataset] = useState("Sentinel-2 (10m)");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  function onNavigate(name: string) {
    const destinations: Record<string, "/" | "/imagery" | "/super-resolution" | "/compare" | "/validation" | "/export" | "/settings"> = {
      Dashboard: "/", Imagery: "/imagery", "Super Resolution": "/super-resolution", Compare: "/compare",
      Analysis: "/", Validation: "/validation", Export: "/export", Settings: "/settings",
    };
    const destination = destinations[name];
    if (destination) navigate({ to: destination });
  }
  return <TooltipProvider delayDuration={250}><div className="dashboard-shell"><Sidebar active={active} onNavigate={onNavigate} open={menuOpen} onClose={() => setMenuOpen(false)} /><div className="dashboard-main"><TopNavbar onMenu={() => setMenuOpen(true)} dataset={dataset} setDataset={setDataset} search={search} setSearch={setSearch} subtitle={subtitle} />{children}</div></div></TooltipProvider>;
}