import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  BarChart3, Building2, CalendarDays, Check, ChevronDown, Crosshair, Download,
  FileDown, Image as ImageIcon, Layers3, Leaf, Loader2, LocateFixed, Map as MapIcon,
  MapPin, Minus, Play, Plus, ShieldCheck, Sparkles, Thermometer, TrendingUp, Waves,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { GeoAppShell } from "@/components/geo-app-shell";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import kanpur from "@/assets/kanpur-satellite.jpg";
import farmland from "@/assets/imagery-farmland.jpg";
import river from "@/assets/imagery-river.jpg";
import coast from "@/assets/imagery-coast.jpg";

type Scene = { id: string; location: string; image: string };
const scenes: Scene[] = [
  { id: "S2A_MSIL2A_20250415T053621", location: "Kanpur, Uttar Pradesh, India", image: kanpur },
  { id: "S2B_MSIL2A_20250412T054631", location: "Lucknow, Uttar Pradesh, India", image: farmland },
  { id: "S2A_MSIL2A_20250408T052621", location: "Ahmedabad, Gujarat, India", image: coast },
];
const resolutions = ["10 m → 2.5 m (4x)", "10 m → 5 m (2x)", "10 m → 3.8 m"];
const analysisTypes = ["Land Cover Classification", "Change Detection", "Vegetation Analysis", "Water Body Analysis", "Urban Expansion"];
const landCover = [
  { name: "Built-up", value: "38.7%", tone: "red" },
  { name: "Vegetation", value: "42.3%", tone: "green" },
  { name: "Water", value: "8.9%", tone: "blue" },
  { name: "Agriculture", value: "7.4%", tone: "yellow" },
  { name: "Others", value: "2.7%", tone: "gray" },
];
const insights = [
  { label: "Dominant Land Cover", value: "Vegetation", pct: "42.3%", icon: Leaf },
  { label: "Urban Area", value: "", pct: "38.7%", icon: Building2 },
  { label: "Water Bodies", value: "", pct: "8.9%", icon: Waves },
  { label: "Agricultural Land", value: "", pct: "7.4%", icon: Sparkles },
];
const trends = [
  { icon: Building2, text: "Urban expansion observed in eastern region" },
  { icon: TrendingUp, text: "Vegetation increase in northern area (+6.2%)" },
  { icon: Waves, text: "Water body stable (<1% change)" },
  { icon: Leaf, text: "No significant change in agricultural zones" },
];
const spectral = [
  { band: "B2", original: 0.14, superResolved: 0.18, reference: 0.21 },
  { band: "B3", original: 0.2, superResolved: 0.25, reference: 0.29 },
  { band: "B4", original: 0.24, superResolved: 0.3, reference: 0.35 },
  { band: "B8", original: 0.62, superResolved: 0.74, reference: 0.82 },
];
const stats = [
  { label: "NDVI", value: "0.687", delta: "↑ 6.4%", icon: Leaf },
  { label: "NDBI", value: "0.231", delta: "↑ 2.1%", icon: Building2 },
  { label: "MNDWI", value: "0.142", delta: "↑ 3.7%", icon: Waves },
  { label: "Land Surface Temp.", value: "32.6 °C", delta: "↓ 1.8%", icon: Thermometer },
];
const features = [
  { label: "Road Network", sub: "Extraction", icon: Layers3 },
  { label: "Building", sub: "Detection", icon: Building2 },
  { label: "Water Body", sub: "Mapping", icon: Waves },
  { label: "Vegetation Health", sub: "(NDVI)", icon: Leaf },
];
const uncertainty = [
  { label: "Low (0–5%)", value: "62%", tone: "green" },
  { label: "Medium (5–15%)", value: "28%", tone: "yellow" },
  { label: "High (15–30%)", value: "8%", tone: "orange" },
  { label: "Very High (>30%)", value: "2%", tone: "red" },
];

function SelectField({ icon: Icon, label, value, options, onSelect }: { icon: typeof MapPin; label: string; value: string; options: string[]; onSelect: (value: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="surface" className="ci-filter"><Icon /><span><small>{label}</small><strong>{value}</strong></span><ChevronDown /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="ci-filter-menu">
        {options.map(option => <DropdownMenuItem key={option} onClick={() => onSelect(option)}>{option}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AnalysisControls({ scene, setScene, resolution, setResolution, analysisType, setAnalysisType, running, onRun }: {
  scene: Scene; setScene: (s: Scene) => void; resolution: string; setResolution: (v: string) => void;
  analysisType: string; setAnalysisType: (v: string) => void; running: boolean; onRun: () => void;
}) {
  return (
    <div className="an-controls">
      <SelectField icon={ImageIcon} label="Scene ID" value={scene.id} options={scenes.map(s => s.id)} onSelect={id => { const next = scenes.find(s => s.id === id); if (next) setScene(next); }} />
      <SelectField icon={MapPin} label="Location" value={scene.location} options={scenes.map(s => s.location)} onSelect={loc => { const next = scenes.find(s => s.location === loc); if (next) setScene(next); }} />
      <SelectField icon={Layers3} label="Resolution" value={resolution} options={resolutions} onSelect={setResolution} />
      <SelectField icon={BarChart3} label="Analysis Type" value={analysisType} options={analysisTypes} onSelect={setAnalysisType} />
      <Button className="an-run" disabled={running} onClick={onRun}>
        {running ? <Loader2 className="an-spin" /> : <Play />}{running ? "Running..." : "Run Analysis"}
      </Button>
    </div>
  );
}

function MapPanel({ scene, mapTab, setMapTab }: { scene: Scene; mapTab: "Enhanced Imagery" | "Classification Map"; setMapTab: (t: "Enhanced Imagery" | "Classification Map") => void }) {
  const [zoom, setZoom] = useState(1);
  return (
    <section className="panel an-map-card">
      <div className="an-map" style={{ "--an-zoom": zoom } as React.CSSProperties}>
        <img src={mapTab === "Enhanced Imagery" ? scene.image : river} alt={`${mapTab} of ${scene.location}`} className={cn(mapTab === "Classification Map" && "an-map-classified")} />
        <div className="an-map-tabs">
          {(["Enhanced Imagery", "Classification Map"] as const).map(tab => (
            <Button key={tab} size="sm" variant={mapTab === tab ? "selected" : "surface"} onClick={() => setMapTab(tab)}>{tab}</Button>
          ))}
        </div>
        <div className="an-map-tools">
          <Button variant="map" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(z => Math.min(2.4, +(z + 0.2).toFixed(1)))}><Plus /></Button>
          <Button variant="map" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))}><Minus /></Button>
          <Button variant="map" size="icon" aria-label="Reset view" title="Reset view" onClick={() => { setZoom(1); toast.info("View reset to AOI-1"); }}><LocateFixed /></Button>
        </div>
        <div className="an-aoi"><span>AOI-1</span></div>
        <div className="an-legend">
          <h3>Land Cover Classes</h3>
          {landCover.map(item => <div key={item.name}><i className={`an-dot-${item.tone}`} /><span>{item.name}</span><b>{item.value}</b></div>)}
        </div>
        <div className="an-scale"><span>0</span><span>2.5</span><span>5</span><span>10 km</span></div>
        <span className="an-north"><Crosshair /></span>
      </div>
    </section>
  );
}

function KeyInsights() {
  return (
    <div className="an-insights">
      <section className="panel an-insight-card">
        <div className="ci-section-title"><BarChart3 /><h2>Key Insights</h2></div>
        {insights.map(item => { const Icon = item.icon; return (
          <div className="an-insight" key={item.label}>
            <span className="an-insight-icon"><Icon /></span>
            <div><small>{item.label}</small>{item.value && <strong>{item.value}</strong>}</div>
            <b>{item.pct}</b>
          </div>
        ); })}
      </section>
      <section className="panel an-trends-card">
        <div className="ci-section-title"><TrendingUp /><h2>Trends &amp; Patterns</h2></div>
        {trends.map(item => { const Icon = item.icon; return (
          <div className="an-trend" key={item.text}><span className="an-insight-icon"><Icon /></span><p>{item.text}</p></div>
        ); })}
      </section>
    </div>
  );
}

function LandCoverCard() {
  return (
    <section className="panel an-card">
      <div className="an-card-head">
        <h2>Land Cover Classification</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="surface" size="sm">View: Classified Map<ChevronDown /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["Classified Map", "Confidence Map", "Probability Map"].map(v => <DropdownMenuItem key={v} onClick={() => toast.info(`${v} view selected`)}>{v}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="an-classified"><img src={river} alt="Land cover classification map" /></div>
      <div className="an-legend-row">
        {landCover.map(item => <span key={item.name}><i className={`an-dot-${item.tone}`} />{item.name} <b>{item.value}</b></span>)}
      </div>
    </section>
  );
}

function ChangeDetection() {
  const [split, setSplit] = useState(50);
  return (
    <section className="panel an-card">
      <div className="an-card-head"><h2>Change Detection</h2></div>
      <div className="an-change" style={{ "--an-split": `${split}%` } as React.CSSProperties}
        onPointerDown={e => { const rect = e.currentTarget.getBoundingClientRect(); const update = (x: number) => setSplit(Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100))); e.currentTarget.setPointerCapture(e.pointerId); update(e.clientX); }}
        onPointerMove={e => { if (e.buttons) { const rect = e.currentTarget.getBoundingClientRect(); setSplit(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))); } }}>
        <img src={farmland} alt="Satellite imagery from 2024-04-15" />
        <div className="an-change-after"><img src={coast} alt="Satellite imagery from 2025-04-15" /></div>
        <span className="an-change-date an-date-left">2024-04-15</span>
        <span className="an-change-date an-date-right">2025-04-15</span>
        <div className="an-change-divider"><span><Layers3 /></span></div>
      </div>
      <div className="an-change-summary">
        <span className="an-insight-icon"><TrendingUp /></span>
        <div><strong>+6.2%</strong><small>Vegetation Increase</small><small>in Northern Region</small></div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Change map opened")}>View Change Map</Button>
      </div>
    </section>
  );
}

function SpectralAnalysis() {
  return (
    <section className="panel an-card">
      <div className="an-card-head">
        <h2>Spectral Analysis</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="surface" size="sm">AOI-1<ChevronDown /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["AOI-1", "AOI-2", "AOI-3"].map(v => <DropdownMenuItem key={v} onClick={() => toast.info(`${v} selected`)}>{v}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="an-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spectral} margin={{ top: 10, right: 8, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="2 2" />
            <XAxis dataKey="band" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <ChartTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} />
            <Line type="linear" dataKey="original" name="Original (10m)" stroke="var(--violet)" strokeDasharray="4 3" strokeWidth={1.5} dot={false} />
            <Line type="linear" dataKey="superResolved" name="Super Resolved (2.5m)" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="linear" dataKey="reference" name="Reference (HR)" stroke="var(--warning)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="v-chart-legend"><span className="v-legend-input">Original (10m)</span><span className="v-legend-sr">Super Resolved (2.5m)</span><span className="v-legend-ref">Reference (HR)</span></div>
    </section>
  );
}

function StatisticalSummary() {
  return (
    <section className="panel an-card">
      <div className="an-card-head"><h2>Statistical Summary</h2></div>
      <div className="an-stats">
        {stats.map(item => { const Icon = item.icon; return (
          <div className="an-stat" key={item.label}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            <span><em>{item.delta}</em><Icon /></span>
          </div>
        ); })}
      </div>
    </section>
  );
}

function FeatureExtraction() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section className="panel an-card">
      <div className="an-card-head"><h2>Feature Extraction</h2></div>
      <div className="an-features">
        {features.map(item => { const Icon = item.icon; const busy = active === item.label; return (
          <Button key={item.label} variant="surface" className={cn("an-feature", busy && "an-feature-active")} disabled={busy}
            onClick={() => { setActive(item.label); setTimeout(() => { setActive(null); toast.success(`${item.label} ${item.sub.toLowerCase()} complete`); }, 1200); }}>
            {busy ? <Loader2 className="an-spin" /> : <Icon />}
            <span>{item.label}<br />{item.sub}</span>
          </Button>
        ); })}
      </div>
    </section>
  );
}

function UncertaintyAnalysis() {
  return (
    <section className="panel an-card">
      <div className="an-card-head"><h2>Uncertainty Analysis</h2></div>
      <div className="an-uncertainty">
        <div className="an-heat"><img src={river} alt="Uncertainty heatmap" /></div>
        <div className="an-donut"><span className="ci-ring an-ring"><strong>8.2%</strong><small>Mean Uncertainty</small></span></div>
        <div className="an-uncertainty-legend">
          {uncertainty.map(item => <div key={item.label}><i className={`an-dot-${item.tone}`} /><span>{item.label}</span><b>{item.value}</b></div>)}
        </div>
      </div>
    </section>
  );
}

export function AnalysisPage() {
  const [scene, setScene] = useState<Scene>(scenes[0]!);
  const [resolution, setResolution] = useState(resolutions[0]!);
  const [analysisType, setAnalysisType] = useState(analysisTypes[0]!);
  const [mapTab, setMapTab] = useState<"Enhanced Imagery" | "Classification Map">("Enhanced Imagery");
  const [running, setRunning] = useState(false);
  const onRun = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); toast.success("Analysis Complete", { description: `${analysisType} finished for ${scene.location}` }); }, 1600);
  };
  return (
    <GeoAppShell active="Analysis" subtitle="AI-Powered Super Resolution Mapping for a Sharper Tomorrow">
      <main className="dashboard-content an-page">
        <section className="panel ci-header">
          <div className="ci-title"><span><BarChart3 /></span><div><h1>Analysis</h1><p>Explore insights, perform analytical operations and extract valuable information from enhanced satellite imagery.</p></div></div>
        </section>
        <AnalysisControls scene={scene} setScene={setScene} resolution={resolution} setResolution={setResolution} analysisType={analysisType} setAnalysisType={setAnalysisType} running={running} onRun={onRun} />
        <div className="an-top"><MapPanel scene={scene} mapTab={mapTab} setMapTab={setMapTab} /><KeyInsights /></div>
        <div className="an-grid">
          <LandCoverCard />
          <ChangeDetection />
          <SpectralAnalysis />
          <StatisticalSummary />
          <FeatureExtraction />
          <UncertaintyAnalysis />
        </div>
        <div className="an-actions">
          <Button onClick={() => toast.success("Analysis report downloaded")}><FileDown />Download Analysis Report</Button>
          <Button variant="outline" onClick={() => toast.success("GeoTIFF export started")}><ShieldCheck />Export GeoTIFF</Button>
          <Button variant="outline" asChild><Link to="/imagery"><MapIcon />View on Map</Link></Button>
        </div>
      </main>
    </GeoAppShell>
  );
}
