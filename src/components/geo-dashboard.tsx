import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity, ArrowDownToLine, ArrowLeftRight, ArrowRight, BrainCircuit, Check, CheckCircle2,
  ChevronDown, CircleDot, ClipboardCheck, Crosshair, Download, Earth, Expand,
  Image as ImageIcon, Layers3, Leaf, MapPin, Menu, Minus, Mountain, Plus,
  Search, Settings2, ShieldCheck, Satellite, Sparkles, TriangleAlert, Trophy,
  X, ChartNoAxesCombined, ScanSearch, PanelsTopLeft, RadioTower, Building2,
  Scan, Gauge, TrendingUp, SlidersHorizontal,
} from "lucide-react";
import satelliteImage from "@/assets/kanpur-satellite.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type IconType = typeof Earth;
type Application = { name: string; description: string; detail: string; icon: IconType; tone: string };
const navigation = [
  { name: "Dashboard", icon: PanelsTopLeft }, { name: "Imagery", icon: ImageIcon },
  { name: "Super Resolution", icon: Sparkles }, { name: "Compare", icon: ArrowLeftRight },
  { name: "Analysis", icon: ChartNoAxesCombined }, { name: "Validation", icon: ShieldCheck },
  { name: "Export", icon: Download }, { name: "Settings", icon: Settings2 },
];
const applications: Application[] = [
  { name: "Classification", description: "Land use / land cover mapping with higher accuracy.", detail: "Identify land cover categories across the area of interest, including built-up zones, water, vegetation, and agricultural land.", icon: BrainCircuit, tone: "teal" },
  { name: "Change Detection", description: "Monitor changes in landscape over time (e.g., urban growth, deforestation).", detail: "Compare observations over time to highlight urban expansion, vegetation loss, and other changes in the landscape.", icon: Mountain, tone: "green" },
  { name: "Urban Mapping", description: "Detect and map buildings, roads and infrastructure.", detail: "Use enhanced spatial detail to trace urban structures, road corridors, and infrastructure footprints.", icon: Building2, tone: "blue" },
  { name: "Crop Monitoring", description: "Track crop health, identify stress and estimate yield.", detail: "Examine field patterns and spectral signals to monitor crop conditions and support yield assessments.", icon: Leaf, tone: "mint" },
  { name: "Disaster Assessment", description: "Assess flood, wildfire, landslide and other natural disasters.", detail: "Inspect affected terrain with sharper imagery to support rapid mapping after floods, wildfires, and landslides.", icon: TriangleAlert, tone: "coral" },
];
const models = ["Swin Transformer", "ESRGAN", "Diffusion Model"] as const;
type Model = (typeof models)[number];

function CardHeading({ children, icon: Icon }: { children: React.ReactNode; icon?: IconType }) {
  return <div className="card-heading">{Icon && <Icon className="size-4 text-primary" />}<h2>{children}</h2></div>;
}

export function Sidebar({ active, onNavigate, open, onClose }: { active: string; onNavigate: (name: string) => void; open: boolean; onClose: () => void }) {
  return <>
    {open && <div className="sidebar-scrim lg:hidden" onClick={onClose} />}
    <aside className={cn("sidebar", open && "sidebar-open")}>
      <div className="sidebar-brand"><div className="brand-mark"><Earth size={24} strokeWidth={2.1} /></div><span>GeoSR Intelligence</span><Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onClose} aria-label="Close menu"><X /></Button></div>
      <nav className="sidebar-nav" aria-label="Main navigation">{navigation.map(({ name, icon: Icon }) => {
        const route = name === "Imagery" ? "/imagery" : name === "Super Resolution" ? "/super-resolution" : name === "Compare" ? "/compare" : name === "Analysis" ? "/analysis" : name === "Validation" ? "/validation" : name === "Export" ? "/export" : name === "Settings" ? "/settings" : null;
        return route ? <Button key={name} asChild variant="ghost" className={cn("nav-item", active === name && "nav-active")}><Link to={route} onClick={onClose}><Icon size={18} strokeWidth={1.8} /><span>{name}</span></Link></Button> : <Button key={name} variant="ghost" className={cn("nav-item", active === name && "nav-active")} onClick={() => { onNavigate(name); onClose(); }}><Icon size={18} strokeWidth={1.8} /><span>{name}</span></Button>;
      })}</nav>
      <div className="sidebar-bottom"><div className="project-note"><div className="project-identity"><Trophy size={19} /><div><strong>SIH 2026</strong><small>PS No. 26142</small></div></div><p className="project-title">Deep Learning Based Super Resolution Mapping (SRM) from Medium Resolution Satellite Imageries</p><div className="project-divider" /><p className="project-description">Enhancing satellite imagery from ~10m to &lt;4m using AI for better geospatial insights.</p><Satellite className="project-satellite" size={28} strokeWidth={1.3} /><div className="project-tagline">Sharper Images <span>|</span> Better Decisions</div></div></div>
    </aside>
  </>;
}

export function TopNavbar({ onMenu, dataset, setDataset, search, setSearch, subtitle = "AI-Powered Super Resolution Mapping for a Sharper Tomorrow" }: { onMenu: () => void; dataset: string; setDataset: (value: string) => void; search: string; setSearch: (value: string) => void; subtitle?: string }) {
  return <header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu /></Button><div className="topbar-brand"><span className="mobile-brand-icon"><Earth size={18} /></span><strong>GeoSR Intelligence</strong></div><span className="topbar-divider" /><span className="topbar-subtitle">{subtitle}</span></div>
    <div className="topbar-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="surface" className="dataset-button"><Layers3 size={15} /><span>{dataset}</span><ChevronDown size={14} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{["Sentinel-2 (10m)", "Landsat 8 (30m)", "Sentinel-1 (10m)"].map((value) => <DropdownMenuItem key={value} onClick={() => { setDataset(value); toast.info(`${value} selected`); }}>{value}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
      <div className="search-wrap"><Search size={16} /><Input aria-label="Search location or AOI" placeholder="Search location / AOI..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && search.trim()) toast.info(`Searching for ${search.trim()}`); }} /></div>
      <div className="status-badge"><span className="status-dot" /> <span>Processing Complete</span></div>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="user-button"><span className="avatar">SD</span><span>Student</span><ChevronDown size={14} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => toast.info("Signed in as Student")}>Student profile</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info("This is a frontend demonstration")}>About this demo</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
  </header>;
}

function MapTool({ icon: Icon, label, onClick, active }: { icon: IconType; label: string; onClick: () => void; active?: boolean }) {
  return <Tooltip><TooltipTrigger asChild><Button variant="map" size="icon" aria-label={label} aria-pressed={active} onClick={onClick} className={cn(active && "map-tool-active")}><Icon size={16} /></Button></TooltipTrigger><TooltipContent side="left">{label}</TooltipContent></Tooltip>;
}

function AOIMap() {
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState(true);
  const [area, setArea] = useState("Uttar Pradesh, India");
  const [selected, setSelected] = useState(true);
  return <section className="map-card" aria-label="Area of Interest map">
    <div className="map-imagery" style={{ transform: `scale(${zoom})` }}><img src={satelliteImage} alt="Satellite view of Kanpur and its surrounding landscape" width={1600} height={1104} /></div>
    <div className="map-shade" />
    {layer && selected && <svg className="aoi-polygon" viewBox="0 0 600 310" preserveAspectRatio="none" aria-label="Selected area of interest boundary"><polygon points="220,132 280,103 333,79 397,179 293,228" fill="var(--aoi-fill)" stroke="var(--primary)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />{[[220,132],[280,103],[333,79],[397,179],[293,228]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3.2" fill="var(--primary)" stroke="var(--foreground)" strokeWidth=".7" />)}</svg>}
    <div className="map-header"><span className="map-header-label"><MapPin size={16} fill="currentColor" />Area of Interest (AOI)</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="map" className="map-location">{area}<ChevronDown size={13} /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onClick={() => { setArea("Uttar Pradesh, India"); setSelected(true); }}>Uttar Pradesh, India</DropdownMenuItem><DropdownMenuItem onClick={() => { setArea("Kanpur Urban AOI"); setSelected(true); }}>Kanpur Urban AOI</DropdownMenuItem><DropdownMenuItem onClick={() => { setSelected(!selected); toast.info(selected ? "AOI selection hidden" : "AOI selection shown"); }}>{selected ? "Hide AOI selection" : "Show AOI selection"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    <div className="mini-map"><img src={satelliteImage} alt="Map overview" width={1600} height={1104} /><span className="mini-marker" /><span className="north">N ↑</span></div>
    <div className="map-controls"><MapTool icon={Layers3} label={layer ? "Hide AOI layer" : "Show AOI layer"} onClick={() => setLayer(!layer)} active={layer} /><div className="map-control-stack"><MapTool icon={Plus} label="Zoom in" onClick={() => setZoom(Math.min(zoom + .2, 2))} /><MapTool icon={Minus} label="Zoom out" onClick={() => setZoom(Math.max(zoom - .2, 1))} /></div><MapTool icon={Crosshair} label="Reset map view" onClick={() => { setZoom(1); setSelected(true); toast.success("Map view reset"); }} /></div>
    <div className="map-pin"><MapPin size={22} fill="currentColor" /><span>Kanpur</span></div>
    <span className="coordinates">26.4499° N, 80.3319° E</span><div className="map-scale"><div className="scale-numbers"><span>0</span><span>2.5</span><span>5</span><span>10 km</span></div><div className="scale-line" /></div>
  </section>;
}

function ProcessingWorkflow({ model, setModel }: { model: Model; setModel: (model: Model) => void }) {
  return <section className="panel workflow-panel"><CardHeading>Processing Workflow</CardHeading><div className="workflow-steps"><div className="workflow-step"><div className="workflow-thumb"><img src={satelliteImage} alt="10 meter input imagery" width={1600} height={1104} /></div><strong>10m Input</strong><small>(Sentinel-2)</small></div><ArrowRight className="workflow-arrow" size={16} /><div className="workflow-step workflow-ai"><div className="ai-symbol"><BrainCircuit size={27} strokeWidth={1.7} /></div><strong>AI Super Resolution</strong><small>(Swin / ESRGAN / Diffusion)</small></div><ArrowRight className="workflow-arrow" size={16} /><div className="workflow-step"><div className="workflow-thumb output-thumb"><img src={satelliteImage} alt="Enhanced output imagery" width={1600} height={1104} /></div><strong>&lt;4m Output</strong><small>&nbsp;</small></div></div>
    <div className="field-label">Model Selection</div><div className="model-options" role="radiogroup" aria-label="Model Selection">{models.map((item) => <Button variant={model === item ? "selected" : "surface"} className="model-option" role="radio" aria-checked={model === item} key={item} onClick={() => setModel(item)}><span className="radio-indicator">{model === item && <span />}</span>{item}</Button>)}</div>
    <div className="progress-label"><span>Processing Progress</span><span>100%</span></div><div className="progress-track"><div className="progress-fill" /></div><p className="success-line"><CheckCircle2 size={15} fill="currentColor" />Super resolution completed successfully!</p><p className="workflow-caption">Output resolution: ~3.8m <span>·</span> Processing time: 12 min 42 sec</p>
  </section>;
}

function ConfidenceIndicator() {
  return <div className="confidence-section"><CardHeading>Uncertainty / Confidence</CardHeading><div className="confidence-content"><div className="confidence-main"><div className="confidence-ring"><strong>92%</strong></div><small>Confidence Score</small></div><div className="confidence-legend"><div><i className="legend-low" /><span>Low Uncertainty</span><b>0 – 5%</b></div><div><i className="legend-medium" /><span>Medium</span><b>5 – 15%</b></div><div><i className="legend-high" /><span>High</span><b>15 – 30%</b></div></div></div></div>;
}
function OutputInformation({ model }: { model: Model }) {
  const rows = [["Input Resolution", "10 m (Sentinel-2)"], ["Output Resolution", "~3.8 m"], ["AOI Size", "24.6 km²"], ["Spectral Bands", "13 (preserved)"], ["Model Used", model]];
  return <section className="panel output-panel"><CardHeading>Output Information</CardHeading><div className="output-info"><div className="output-thumbnail"><img src={satelliteImage} alt="Output satellite thumbnail" width={1600} height={1104} /><span /></div><dl>{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div><ConfidenceIndicator /></section>;
}

export function ImageViewer({ blurred = false, className = "" }: { blurred?: boolean; className?: string }) {
  return <div className={cn("image-viewer", className, blurred && "image-blurred")}><img src={satelliteImage} alt={blurred ? "Lower-resolution satellite imagery" : "Enhanced satellite imagery"} width={1600} height={1104} /></div>;
}
export function BeforeAfterComparison() {
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  function updateSplit(clientX: number) { const rect = container.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(2, Math.min(98, (clientX - rect.left) / rect.width * 100))); }
  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) { e.currentTarget.setPointerCapture(e.pointerId); updateSplit(e.clientX); }
  const comparison = <div className="comparison-stage" ref={container} onPointerDown={handlePointerDown} onPointerMove={(e) => { if (e.buttons) updateSplit(e.clientX); }} style={{ "--split": `${split}%`, "--compare-zoom": zoom } as CSSProperties}>
    <ImageViewer className="compare-after" /><ImageViewer blurred className="compare-before" /><span className="image-chip chip-before">Before (10m)</span><span className="image-chip chip-after">After (&lt;4m)</span><div className="compare-divider"><span className="compare-handle"><ArrowLeftRight size={15} /></span></div><div className="compare-controls" onPointerDown={(e) => e.stopPropagation()}><Button variant="map" size="icon" title="Toggle fullscreen" aria-label="Toggle fullscreen" onClick={() => setFullscreen(!fullscreen)}><Expand /></Button><Button variant="map" size="icon" title="Zoom in comparison" aria-label="Zoom in comparison" onClick={() => setZoom(Math.min(zoom + .2, 2))}><Plus /></Button><Button variant="map" size="icon" title="Zoom out comparison" aria-label="Zoom out comparison" onClick={() => setZoom(Math.max(zoom - .2, 1))}><Minus /></Button></div></div>;
  return <section className="panel comparison-panel"><CardHeading>Before vs After (Super Resolution Comparison)</CardHeading>{comparison}<Dialog open={fullscreen} onOpenChange={setFullscreen}><DialogContent className="comparison-dialog"><DialogHeader><DialogTitle>Before vs After</DialogTitle><DialogDescription>Drag the divider to inspect the enhanced imagery.</DialogDescription></DialogHeader><div className="fullscreen-comparison">{fullscreen && <FullscreenComparison />}</div></DialogContent></Dialog></section>;
}
function FullscreenComparison() {
  const [split, setSplit] = useState(50); const ref = useRef<HTMLDivElement>(null);
  function move(x: number) { const rect = ref.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(2, Math.min(98, (x - rect.left) / rect.width * 100))); }
  return <div className="comparison-stage" ref={ref} style={{ "--split": `${split}%` } as CSSProperties} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }} onPointerMove={(e) => { if (e.buttons) move(e.clientX); }}><ImageViewer className="compare-after" /><ImageViewer blurred className="compare-before" /><span className="image-chip chip-before">Before (10m)</span><span className="image-chip chip-after">After (&lt;4m)</span><div className="compare-divider"><span className="compare-handle"><ArrowLeftRight size={15} /></span></div></div>;
}

const metrics = [
  { label: "PSNR", direction: "↑", value: "32.48", unit: "dB", caption: "Higher is better", progress: 91, icon: TrendingUp, tone: "teal" },
  { label: "SSIM", direction: "↑", value: "0.912", unit: "", caption: "Higher is better", progress: 96, icon: ChartNoAxesCombined, tone: "blue" },
  { label: "Spatial Resolution", direction: "↓", value: "3.8", unit: "m", caption: "(from 10 m)", progress: 97, icon: Crosshair, tone: "violet" },
  { label: "Spectral Consistency", direction: "↑", value: "0.967", unit: "", caption: "(0 – 1)", progress: 96, icon: Gauge, tone: "amber" },
];
function MetricCard({ metric }: { metric: typeof metrics[number] }) { const Icon = metric.icon; return <div className={cn("metric-card", `tone-${metric.tone}`)}><div className="metric-top"><span>{metric.label} <em>{metric.direction}</em></span><span className="metric-icon"><Icon size={17} /></span></div><div className="metric-value">{metric.value} <small>{metric.unit}</small></div><p>{metric.caption}</p><div className="metric-track"><span style={{ width: `${metric.progress}%` }} /></div></div>; }
function QualityMetrics() { return <section className="panel metrics-panel"><CardHeading>Quality Metrics</CardHeading><div className="metrics-grid">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div></section>; }

function GeospatialApplications() {
  const [selected, setSelected] = useState<Application | null>(null);
  return <section className="panel apps-panel"><div className="section-heading"><h2>Geospatial Applications</h2><p>Enable better decisions with high-resolution, AI-enhanced imagery</p></div><div className="applications-grid">{applications.map((app) => { const Icon = app.icon; return <div className={cn("application-card", `tone-${app.tone}`)} key={app.name}><div className="application-icon"><Icon size={24} strokeWidth={1.8} /></div><h3>{app.name}</h3><p>{app.description}</p><Button variant="link" className="details-link" onClick={() => setSelected(app)}>View Details <ArrowRight size={13} /></Button></div>; })}</div><Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{selected?.detail}</DialogDescription></DialogHeader><div className="detail-note"><CheckCircle2 size={17} /> Available for the current Kanpur area of interest</div></DialogContent></Dialog></section>;
}
export function ValidationPanel({ onReport }: { onReport: () => void }) {
  return <section className="panel validation-panel"><CardHeading>Validation Against High-Resolution Reference</CardHeading><div className="validation-body"><div className="validation-thumbs"><div><ImageViewer /><span>Output (SRM)</span></div><div><ImageViewer className="reference-view" /><span>Reference (HR)</span></div><div><div className="difference-view"><ImageViewer /><span className="difference-mesh" /></div><span>Difference Map</span></div></div><div className="validation-scores"><div><span>PSNR</span><strong>34.21 dB</strong></div><div><span>SSIM</span><strong>0.945</strong></div><div><span>RMSE</span><strong>0.032</strong></div><span className="match-badge"><Check size={13} /> Good Match</span></div></div><div className="validation-actions"><Button variant="default" onClick={() => toast.success("GeoTIFF export started")}><Download size={16} /> Export GeoTIFF</Button><Button variant="outline" onClick={onReport}>View Report</Button></div></section>;
}
export function ReportModal({ open, onOpenChange, model }: { open: boolean; onOpenChange: (open: boolean) => void; model: Model }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="report-dialog"><DialogHeader><DialogTitle>Super Resolution Report</DialogTitle><DialogDescription>Kanpur, Uttar Pradesh · Sentinel-2 imagery · Processing complete</DialogDescription></DialogHeader><div className="report-summary"><div><span>Model</span><strong>{model}</strong></div><div><span>Input resolution</span><strong>10 m</strong></div><div><span>Output resolution</span><strong>~3.8 m</strong></div><div><span>Area of interest</span><strong>24.6 km²</strong></div><div><span>PSNR</span><strong>34.21 dB</strong></div><div><span>SSIM</span><strong>0.945</strong></div><div><span>RMSE</span><strong>0.032</strong></div><div><span>Confidence</span><strong>92%</strong></div></div><div className="report-result"><ClipboardCheck size={19} /> Good match against high-resolution reference</div></DialogContent></Dialog>;
}

export function GeoDashboard() {
  const [active, setActive] = useState("Dashboard"); const [menuOpen, setMenuOpen] = useState(false);
  const [dataset, setDataset] = useState("Sentinel-2 (10m)"); const [search, setSearch] = useState("");
  const [model, setModel] = useState<Model>("Swin Transformer"); const [reportOpen, setReportOpen] = useState(false);
  function navigate(name: string) { setActive(name); if (name !== "Dashboard") { const targets: Record<string, string> = { Imagery: "map-section", Compare: "comparison-section", Analysis: "metrics-section" }; const target = targets[name]; if (target) document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" }); if (name === "Settings") toast.info("Settings are not available in this preview"); } else window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <TooltipProvider delayDuration={250}><div className="dashboard-shell"><Sidebar active={active} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} /><div className="dashboard-main"><TopNavbar onMenu={() => setMenuOpen(true)} dataset={dataset} setDataset={setDataset} search={search} setSearch={setSearch} /><main className="dashboard-content"><div className="dashboard-grid top-grid"><div id="map-section"><AOIMap /></div><div id="workflow-section"><ProcessingWorkflow model={model} setModel={setModel} /></div><OutputInformation model={model} /></div><div className="dashboard-grid lower-grid"><div id="comparison-section"><BeforeAfterComparison /></div><div id="metrics-section"><QualityMetrics /></div><GeospatialApplications /><div id="validation-section"><ValidationPanel onReport={() => setReportOpen(true)} /></div></div></main></div><ReportModal open={reportOpen} onOpenChange={setReportOpen} model={model} /></div></TooltipProvider>;
}
