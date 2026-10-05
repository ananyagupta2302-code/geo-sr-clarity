import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { toast } from "sonner";
import {
  ArrowLeftRight, Bell, CalendarDays, ChartNoAxesCombined, Check, ChevronDown,
  Download, Expand, FileDown, Image as ImageIcon, Info, Layers3, MapPin,
  Minus, PanelLeftClose, PanelTop, Plus, ScanSearch, SlidersHorizontal,
  TrendingDown, TrendingUp,
} from "lucide-react";
import { GeoAppShell } from "@/components/geo-app-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import kanpur from "@/assets/kanpur-satellite.jpg";
import farmland from "@/assets/imagery-farmland.jpg";
import river from "@/assets/imagery-river.jpg";
import coast from "@/assets/imagery-coast.jpg";

type ViewMode = "Split View" | "Swipe Slider" | "Overlay";
type LayerId = "original" | "enhanced" | "reference";
type MetricTab = "Quantitative" | "Spectral";
type Scene = { id: string; location: string; resolution: string; date: string; image: string };

const scenes: Scene[] = [
  { id: "S2A_MSIL2A_20250415T053621", location: "Kanpur, Uttar Pradesh, India", resolution: "10 m → 2.5 m (4x)", date: "2025-04-15 05:36", image: kanpur },
  { id: "S2B_MSIL2A_20250412T054631", location: "Lucknow, Uttar Pradesh, India", resolution: "10 m → 2.5 m (4x)", date: "2025-04-12 05:46", image: farmland },
  { id: "S2A_MSIL2A_20250408T052621", location: "Ahmedabad, Gujarat, India", resolution: "10 m → 2.5 m (4x)", date: "2025-04-08 05:26", image: coast },
];
const previewLayers = [
  { id: "original" as const, title: "Original (10 m)", image: kanpur, resolution: "Resolution: 10 m", bands: "Bands: B2, B3, B4, B8 (10m)" },
  { id: "enhanced" as const, title: "Super Resolved (2.5 m)", image: river, resolution: "Resolution: 2.5 m (4x)", bands: "Bands: B2, B3, B4, B8 (2.5m)" },
  { id: "reference" as const, title: "Reference (High Res)", image: farmland, resolution: "Resolution: 1 m", bands: "Bands: B2, B3, B4, B8 (1m)" },
  { id: "zoom" as const, title: "Zoomed View", image: coast, resolution: "200%", bands: "Fine-detail inspection" },
];
const qualityMetrics = [
  { label: "PSNR", direction: "↑", value: "34.28 dB", note: "(vs. 1m ref)", icon: TrendingUp },
  { label: "SSIM", direction: "↑", value: "0.912", note: "(vs. 1m ref)", icon: TrendingUp },
  { label: "RMSE", direction: "↓", value: "0.873", note: "(vs. 1m ref)", icon: TrendingDown },
  { label: "SAM", direction: "↓", value: "1.24", note: "(vs. 1m ref)", icon: TrendingDown },
];
const spectral = [
  { name: "B2 (Blue)", value: 96, score: "0.96", tone: "blue" },
  { name: "B3 (Green)", value: 94, score: "0.94", tone: "green" },
  { name: "B4 (Red)", value: 93, score: "0.93", tone: "red" },
  { name: "B8 (NIR)", value: 91, score: "0.91", tone: "violet" },
];

function SelectField({ icon: Icon, label, value, options, onSelect }: { icon: typeof MapPin; label: string; value: string; options: string[]; onSelect: (value: string) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="surface" className="ci-filter"><Icon /><span><small>{label}</small><strong>{value}</strong></span><ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="ci-filter-menu">{options.map(option => <DropdownMenuItem key={option} onClick={() => onSelect(option)}>{option}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
}

function ComparisonHeader({ scene, setScene }: { scene: Scene; setScene: (scene: Scene) => void }) {
  return <section className="panel ci-header"><div className="ci-title"><span><ArrowLeftRight /></span><div><h1>Compare Imagery</h1><p>Compare original, enhanced and reference imagery to evaluate the super resolution performance.</p></div></div><div className="ci-filters"><SelectField icon={ImageIcon} label="Scene ID" value={scene.id} options={scenes.map(item => item.id)} onSelect={id => { const next = scenes.find(item => item.id === id); if (next) setScene(next); }} /><SelectField icon={MapPin} label="Location" value={scene.location} options={scenes.map(item => item.location)} onSelect={location => { const next = scenes.find(item => item.location === location); if (next) setScene(next); }} /><SelectField icon={Layers3} label="Resolution" value={scene.resolution} options={[scene.resolution, "10 m → 3.8 m", "10 m → 5 m (2x)"]} onSelect={value => toast.info(`${value} comparison selected`)} /><SelectField icon={CalendarDays} label="Acquisition Date" value={scene.date} options={scenes.map(item => item.date)} onSelect={date => { const next = scenes.find(item => item.date === date); if (next) setScene(next); }} /></div></section>;
}

function ComparisonViewer({ scene, mode, opacity, fullscreen = false }: { scene: Scene; mode: ViewMode; opacity: number; fullscreen?: boolean }) {
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const updateSplit = (clientX: number) => { const rect = ref.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100))); };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => { if (mode === "Overlay") return; event.currentTarget.setPointerCapture(event.pointerId); updateSplit(event.clientX); };
  const style = { "--ci-split": mode === "Split View" ? "50%" : `${split}%`, "--ci-zoom": zoom, "--ci-opacity": opacity / 100 } as CSSProperties;
  return <><div ref={ref} className={cn("ci-viewer", `ci-mode-${mode.toLowerCase().replace(" ", "-")}`, fullscreen && "ci-viewer-full")} style={style} onPointerDown={onPointerDown} onPointerMove={event => { if (event.buttons && mode !== "Overlay") updateSplit(event.clientX); }}>
    <img className="ci-base-image" src={scene.image} alt={`Original satellite imagery of ${scene.location}`} />
    <div className="ci-enhanced-image"><img src={river} alt={`Super-resolved satellite imagery of ${scene.location}`} /></div>
    <span className="ci-image-label ci-original-label">Original (10 m)</span><span className="ci-image-label ci-enhanced-label">Super Resolved (2.5 m)</span>
    {mode !== "Overlay" && <div className="ci-divider"><span><ArrowLeftRight /></span></div>}
    <div className="ci-location"><MapPin />{scene.location}</div>
    <div className="ci-map-tools" onPointerDown={event => event.stopPropagation()}><Button variant="map" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(value => Math.min(2.4, +(value + .2).toFixed(1)))}><Plus /></Button><Button variant="map" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(value => Math.max(1, +(value - .2).toFixed(1)))}><Minus /></Button>{!fullscreen && <Button variant="map" size="icon" aria-label="Open fullscreen viewer" title="Fullscreen" onClick={() => setOpen(true)}><Expand /></Button>}</div>
    {mode === "Overlay" && <span className="ci-opacity-chip">Overlay {opacity}%</span>}
  </div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="ci-fullscreen"><DialogHeader><DialogTitle>Compare Imagery</DialogTitle><DialogDescription>{mode} · {scene.location}</DialogDescription></DialogHeader>{open && <ComparisonViewer scene={scene} mode={mode} opacity={opacity} fullscreen />}</DialogContent></Dialog></>;
}

function PreviewCards({ selected, setSelected }: { selected: LayerId; setSelected: (layer: LayerId) => void }) {
  return <div className="ci-previews">{previewLayers.map(layer => <article className={cn("ci-preview", layer.id === selected && "ci-preview-selected")} key={layer.id}><Button variant="ghost" onClick={() => { if (layer.id !== "zoom") setSelected(layer.id); }} aria-pressed={layer.id === selected}><span className="ci-preview-title">{layer.title}</span><span className="ci-preview-image"><img src={layer.image} alt={`${layer.title} preview`} />{layer.id === "zoom" && <b><ScanSearch />200%</b>}</span><small>{layer.resolution}</small><small>{layer.bands}</small></Button></article>)}</div>;
}

function ModeSelection({ selected, setSelected, mode, setMode, opacity, setOpacity }: { selected: LayerId; setSelected: (layer: LayerId) => void; mode: ViewMode; setMode: (mode: ViewMode) => void; opacity: number; setOpacity: (value: number) => void }) {
  const layers = previewLayers.slice(0, 3);
  const modes: { label: ViewMode; icon: typeof PanelTop }[] = [{ label: "Split View", icon: PanelTop }, { label: "Swipe Slider", icon: SlidersHorizontal }, { label: "Overlay", icon: PanelLeftClose }];
  return <section className="panel ci-modes"><div className="ci-section-title"><ImageIcon /><h2>Side-by-Side Comparison</h2></div><div className="ci-mode-body"><div className="ci-layer-options">{layers.map(layer => <Button key={layer.id} variant="surface" className={cn(layer.id === selected && "ci-layer-selected")} onClick={() => setSelected(layer.id as LayerId)}><img src={layer.image} alt="" /><span><i>{layer.id === selected && <Check />}</i>{layer.title.replace("High Res", "1 m")}</span></Button>)}</div><div className="ci-view-mode"><h3>View Mode</h3><div>{modes.map(item => { const Icon = item.icon; return <Button key={item.label} variant={mode === item.label ? "selected" : "surface"} onClick={() => setMode(item.label)}><Icon />{item.label}</Button>; })}</div>{mode === "Overlay" && <label><span>Overlay opacity</span><b>{opacity}%</b><input type="range" min="0" max="100" value={opacity} onChange={event => setOpacity(Number(event.target.value))} /></label>}</div></div></section>;
}

function MetricsPanel({ tab, setTab }: { tab: MetricTab; setTab: (tab: MetricTab) => void }) {
  return <aside className="ci-metrics"><section className="panel ci-metric-panel"><div className="ci-section-title"><ChartNoAxesCombined /><h2>Comparison Metrics</h2></div><div className="ci-tabs" role="tablist">{(["Quantitative", "Spectral"] as const).map(item => <Button key={item} role="tab" aria-selected={tab === item} variant={tab === item ? "selected" : "surface"} onClick={() => setTab(item)}>{item}</Button>)}</div>{tab === "Quantitative" ? <><h3>Image Quality Metrics</h3><div className="ci-quality-grid">{qualityMetrics.map(metric => { const Icon = metric.icon; return <div key={metric.label}><span>{metric.label} <em>{metric.direction}</em><Icon /></span><strong>{metric.value}</strong><small>{metric.note}</small></div>; })}</div></> : <div className="ci-spectral-detail"><strong>Spectral fidelity profile</strong><p>Reflectance consistency remains above 0.90 across all selected Sentinel-2 bands.</p>{spectral.map(item => <span key={item.name}>{item.name}<b>{item.score}</b></span>)}</div>}
    <div className="ci-spectral"><h3>Spectral Consistency</h3>{spectral.map(item => <div key={item.name}><span>{item.name}</span><i><b className={`ci-bar-${item.tone}`} style={{ width: `${item.value}%` }} /></i><strong>{item.score}</strong></div>)}</div>
    <div className="ci-confidence"><h3>Confidence &amp; Uncertainty</h3><div><span className="ci-ring"><strong>92%</strong></span><dl><div><dt>Confidence Score</dt><dd>92%</dd></div><div><dt>Uncertainty</dt><dd>8%</dd></div><span><i /></span></dl></div></div>
    <aside className="ci-warning"><Info /><p>Reconstructed details are model-inferred and may not be actual ground truth. Please validate with high-resolution reference data and use uncertainty information for analysis.</p></aside></section>
    <section className="panel ci-export"><div className="ci-section-title"><Download /><h2>Export / Share</h2></div><Button onClick={() => toast.success("Comparison report generated")}><FileDown />Download Comparison Report</Button><Button variant="outline" onClick={() => toast.success("GeoTIFF export started")}><Download />Export Images (GeoTIFF)</Button></section></aside>;
}

export function CompareImageryPage() {
  const [scene, setScene] = useState<Scene>(scenes[0]);
  const [mode, setMode] = useState<ViewMode>("Split View");
  const [selected, setSelected] = useState<LayerId>("enhanced");
  const [opacity, setOpacity] = useState(70);
  const [tab, setTab] = useState<MetricTab>("Quantitative");
  const subtitle = useMemo(() => "AI-Powered Super Resolution Mapping for a Sharper Tomorrow", []);
  return <GeoAppShell active="Compare" subtitle={subtitle}><main className="dashboard-content ci-page"><div className="ci-layout"><div className="ci-workspace"><ComparisonHeader scene={scene} setScene={setScene} /><ComparisonViewer scene={scene} mode={mode} opacity={opacity} /><PreviewCards selected={selected} setSelected={setSelected} /><ModeSelection selected={selected} setSelected={setSelected} mode={mode} setMode={setMode} opacity={opacity} setOpacity={setOpacity} /></div><MetricsPanel tab={tab} setTab={setTab} /></div></main></GeoAppShell>;
}
