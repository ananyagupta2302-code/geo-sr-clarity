import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { toast } from "sonner";
import { AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { ArrowLeftRight, ArrowRight, ChartNoAxesCombined, Check, CheckCircle2, ClipboardList, Crosshair, Download, Expand, FileImage, Info, Layers3, Microscope, Minus, Plus, ScanSearch, Settings2, ShieldCheck, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GeoAppShell } from "@/components/geo-app-shell";
import satelliteImage from "@/assets/kanpur-satellite.jpg";
import errorMap from "@/assets/kanpur-error-map.jpg";
import { cn } from "@/lib/utils";

type ViewKind = "output" | "reference" | "difference";
const views: { kind: ViewKind; title: string }[] = [
  { kind: "output", title: "Super-Resolved Output (<4m)" },
  { kind: "reference", title: "High-Resolution Reference" },
  { kind: "difference", title: "Difference / Error Map" },
];
const metricData = [
  { label: "PSNR", direction: "↑", value: "34.21", unit: "dB", caption: "Higher is better", tone: "teal", percent: 85 },
  { label: "SSIM", direction: "↑", value: "0.945", unit: "", caption: "Higher is better", tone: "green", percent: 94 },
  { label: "RMSE", direction: "↓", value: "0.032", unit: "", caption: "Lower is better", tone: "violet", percent: 90 },
  { label: "SAM", direction: "↓", value: "2.8°", unit: "", caption: "Lower is better", tone: "blue", percent: 83 },
  { label: "Spectral Consistency", direction: "↑", value: "0.967", unit: "", caption: "Higher is better", tone: "amber", percent: 96 },
  { label: "Spatial Resolution", direction: "↑", value: "3.8", unit: "m", caption: "Higher is better", tone: "teal", percent: 90 },
];
const spectral = [
  { band: "B02", superResolved: .29, reference: .36, input: .20 },
  { band: "B03", superResolved: .43, reference: .48, input: .29 },
  { band: "B04", superResolved: .37, reference: .42, input: .22 },
  { band: "B08", superResolved: .81, reference: .70, input: .57 },
];
const bands = [
  { band: "B02 (Blue)", tone: "blue", psnr: "33.76", ssim: "0.932", sam: "3.1" },
  { band: "B03 (Green)", tone: "green", psnr: "34.12", ssim: "0.941", sam: "2.8" },
  { band: "B04 (Red)", tone: "red", psnr: "34.87", ssim: "0.952", sam: "2.5" },
  { band: "B08 (NIR)", tone: "violet", psnr: "35.03", ssim: "0.957", sam: "2.2" },
];
const fidelity = [
  { title: "Roads & Transport Network", area: "roads", status: "PASS", checks: ["Road continuity", "Edge sharpness", "Alignment accuracy"] },
  { title: "Field Boundaries & Agriculture", area: "fields", status: "PASS", checks: ["Boundary delineation", "Pattern consistency", "No spatial distortion"] },
  { title: "River / Water Edges", area: "river", status: "PASS", checks: ["Water boundary", "Shape consistency", "No spectral bleeding"] },
  { title: "Buildings & Urban Structures", area: "urban", status: "ATTENTION", checks: ["Minor edge fuzziness", "Some small buildings missed", "Overall structure preserved"] },
];
const trace = [
  { title: "Input GeoTIFF", icon: FileImage, image: true, lines: ["Sentinel-2 (10m)", "10m resolution", "4 bands (B02, B03, B04, B08)"] },
  { title: "Preprocessing", icon: Settings2, lines: ["Cloud masking", "Radiometric correction", "Geometric alignment"] },
  { title: "SR Model", icon: ScanSearch, lines: ["Deep Learning (SRM)", "10m → <4m", "Spectral consistency"] },
  { title: "Output GeoTIFF", icon: FileImage, image: true, lines: ["<4m resolution", "~3.8m output", "4 bands B02, B03, B04, B08"] },
  { title: "Metrics & Validation", icon: ChartNoAxesCombined, lines: ["PSNR / SSIM / RMSE", "SAM / Spectral Consistency", "Spatial Fidelity Checks"] },
];
function Panel({ title, icon: Icon, children, className = "" }: { title: string; icon: typeof Microscope; children: React.ReactNode; className?: string }) {
  return <section className={cn("panel v-panel", className)}><div className="card-heading"><Icon size={16} className="text-primary" /><h2>{title}</h2></div>{children}</section>;
}
function ViewImage({ kind, zoom, opacity, swipe, split, setSplit, onZoom, onFullscreen, layers, onLayers, large = false }: { kind: ViewKind; zoom: number; opacity: number; swipe: boolean; split: number; setSplit: (n: number) => void; onZoom: (delta: number) => void; onFullscreen: (kind: ViewKind) => void; layers: Record<ViewKind, boolean>; onLayers: (kind: ViewKind) => void; large?: boolean }) {
  const view = views.find(item => item.kind === kind);
  const ref = useRef<HTMLDivElement>(null);
  const update = (x: number) => { const rect = ref.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(2, Math.min(98, (x - rect.left) / rect.width * 100))); };
  const onDown = (event: PointerEvent<HTMLDivElement>) => { if (swipe && kind === "output") { event.currentTarget.setPointerCapture(event.pointerId); update(event.clientX); } };
  return <div className={cn("v-view", large && "v-view-large")}>
    <div className="v-view-heading"><strong>{view?.title}</strong><span>Zoom {zoom.toFixed(1)}x</span></div>
    <div className={cn("v-map", `v-map-${kind}`, swipe && kind === "output" && "v-map-swipe")} ref={ref} onPointerDown={onDown} onPointerMove={event => { if (event.buttons && swipe && kind === "output") update(event.clientX); }} style={{ "--v-zoom": zoom / 4.2, "--v-opacity": opacity / 100, "--v-split": `${split}%` } as CSSProperties}>
      <img className="v-map-base" src={kind === "difference" ? errorMap : satelliteImage} alt={kind === "difference" ? "Kanpur difference and error heatmap" : `${view?.title} satellite view of Kanpur`} />
      {kind === "output" && layers[kind] && <div className={cn("v-reference-overlay", swipe && "v-reference-swipe")}><img src={satelliteImage} alt="High-resolution reference overlay" /></div>}
      {swipe && kind === "output" && layers[kind] && <div className="v-swipe-divider"><span><ArrowLeftRight size={15} /></span></div>}
      {kind !== "difference" && <span className="v-kanpur">Kanpur</span>}
      {layers[kind] && <span className="v-north">N ↑</span>}
      <div className="v-map-tools" onPointerDown={event => event.stopPropagation()}>
        <Button variant="map" size="icon" aria-label={`Toggle ${view?.title} layer`} aria-pressed={layers[kind]} title="Toggle layer" onClick={() => onLayers(kind)}><Layers3 size={15} /></Button>
        <Button variant="map" size="icon" aria-label={`Zoom in ${view?.title}`} title="Zoom in all views" onClick={() => onZoom(.4)}><Plus size={15} /></Button>
        <Button variant="map" size="icon" aria-label={`Zoom out ${view?.title}`} title="Zoom out all views" onClick={() => onZoom(-.4)}><Minus size={15} /></Button>
        <Button variant="map" size="icon" aria-label={`Fullscreen ${view?.title}`} title="Fullscreen" onClick={() => onFullscreen(kind)}><Expand size={14} /></Button>
      </div>
      <div className="v-scale"><div><span>0</span><span>1</span><span>2</span><span>4 km</span></div><i /></div><span className="v-coordinates">26.4499°N, 80.3319°E</span>
    </div>
  </div>;
}
function ThreeWayComparison() {
  const [zoom, setZoom] = useState(4.2);
  const [opacity, setOpacity] = useState(70);
  const [swipe, setSwipe] = useState(false);
  const [split, setSplit] = useState(50);
  const [fullscreen, setFullscreen] = useState<ViewKind | null>(null);
  const [layers, setLayers] = useState<Record<ViewKind, boolean>>({ output: true, reference: true, difference: true });
  const toggleLayer = (kind: ViewKind) => setLayers(current => ({ ...current, [kind]: !current[kind] }));
  const shared = { zoom, opacity, swipe, split, setSplit, onZoom: (delta: number) => setZoom(current => Math.max(1, Math.min(8, Math.round((current + delta) * 10) / 10))), onFullscreen: setFullscreen, layers, onLayers: toggleLayer };
  return <Panel title="Three-Way Comparison (Synchronized View)" icon={ScanSearch} className="v-comparison"><div className="v-comparison-controls"><span className="v-pass"><CheckCircle2 size={13} />Geospatial Alignment: PASS</span><Button variant={swipe ? "selected" : "surface"} size="sm" aria-pressed={swipe} onClick={() => setSwipe(!swipe)}><ArrowLeftRight size={13} /> Swipe</Button><label className="v-opacity">Opacity <input type="range" min="0" max="100" value={opacity} onChange={event => setOpacity(Number(event.target.value))} aria-label="Comparison opacity" /><strong>{opacity}%</strong></label><span className="v-zoom-label"><SearchIcon /> Zoom {zoom.toFixed(1)}x</span><Button variant="surface" size="icon" title="Fullscreen comparison" aria-label="Fullscreen comparison" onClick={() => setFullscreen("output")}><Expand size={15} /></Button></div><div className="v-three-views">{views.map(view => <ViewImage key={view.kind} kind={view.kind} {...shared} />)}</div><Dialog open={fullscreen !== null} onOpenChange={open => { if (!open) setFullscreen(null); }}><DialogContent className="v-fullscreen-dialog"><DialogHeader><DialogTitle>{views.find(view => view.kind === fullscreen)?.title}</DialogTitle><DialogDescription>Kanpur · synchronized at {zoom.toFixed(1)}x</DialogDescription></DialogHeader>{fullscreen && <ViewImage kind={fullscreen} {...shared} large />}</DialogContent></Dialog></Panel>;
}
function SearchIcon() { return <Crosshair size={13} />; }
function ValidationSummary() { return <Panel title="Validation Summary" icon={Microscope} className="v-summary"><div className="v-metrics">{metricData.map(metric => <div className={cn("v-metric", `tone-${metric.tone}`)} key={metric.label}><span>{metric.label} <em>{metric.direction}</em></span><strong>{metric.value} <small>{metric.unit}</small></strong><small>{metric.caption}</small><div className="v-meter"><i style={{ width: `${metric.percent}%` }} /></div></div>)}</div></Panel>; }
function SpectralComparisonChart() { return <Panel title="Spectral Comparison (Representative Pixel)" icon={ChartNoAxesCombined} className="v-spectral"><div className="v-chart-row"><span className="v-axis-y">Reflectance</span><div className="v-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={spectral} margin={{ top: 10, right: 8, left: -25, bottom: 0 }}><CartesianGrid stroke="var(--line)" strokeDasharray="2 2" /><XAxis dataKey="band" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} /><YAxis domain={[0, 1]} ticks={[0, .5, 1]} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} axisLine={false} tickLine={false} /><ChartTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 11 }} /><Line type="linear" dataKey="superResolved" name="Super-Resolved" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} /><Line type="linear" dataKey="reference" name="Reference (HR)" stroke="var(--warning)" strokeWidth={2} dot={{ r: 2 }} /><Line type="linear" dataKey="input" name="Input (10m)" stroke="var(--violet)" strokeDasharray="4 3" strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer></div><div className="v-chart-legend"><span className="v-legend-sr">Super-Resolved</span><span className="v-legend-ref">Reference (HR)</span><span className="v-legend-input">Input (10m)</span></div></div><div className="v-axis-x">Sentinel-2 Bands</div></Panel>; }
function PerBandMetrics() { return <Panel title="Per-Band Metrics" icon={SlidersHorizontal} className="v-band-panel"><div className="v-table-scroll"><table className="v-band-table"><thead><tr><th>Band</th><th>PSNR (dB) ↑</th><th>SSIM ↑</th><th>SAM (°) ↓</th></tr></thead><tbody>{bands.map(band => <tr key={band.band}><td><i className={`v-band-dot v-band-${band.tone}`} />{band.band}</td><td>{band.psnr}</td><td>{band.ssim}</td><td>{band.sam}</td></tr>)}</tbody></table></div></Panel>; }
function FidelityCheckCard({ item }: { item: typeof fidelity[number] }) { return <div className="v-fidelity-item"><h3>{item.title}</h3><div className="v-fidelity-body"><img src={satelliteImage} alt={`${item.title} satellite detail`} className={`v-crop-${item.area}`} /><div><span className={cn("v-check-badge", item.status === "ATTENTION" && "v-attention")}>{item.status === "PASS" ? <Check size={12} /> : <TriangleAlert size={12} />}{item.status}</span><ul>{item.checks.map((check, index) => <li key={check} className={item.status === "ATTENTION" && index < 2 ? "v-warning-text" : ""}>{item.status === "ATTENTION" && index < 2 ? <TriangleAlert size={11} /> : <Check size={11} />}{check}</li>)}</ul></div></div></div>; }
function SpatialFidelityChecks() { return <Panel title="Spatial Fidelity Checks" icon={ScanSearch} className="v-fidelity"><div className="v-fidelity-grid">{fidelity.map(item => <FidelityCheckCard item={item} key={item.title} />)}</div><div className="v-fidelity-footer"><ClipboardList size={14} /><strong>Validation Traceability</strong><p>Validation compares the super-resolved product with a co-registered high-resolution reference; metrics are scene- and reference-dependent.</p></div></Panel>; }
function UncertaintyMap() { return <Panel title="Uncertainty & Error" icon={Microscope} className="v-uncertainty"><div className="v-uncertainty-content"><div className="v-error-image"><img src={errorMap} alt="Heatmap of uncertainty and differences around Kanpur" /><span className="v-north">N ↑</span><div className="v-scale"><div><span>0</span><span>1</span><span>2</span><span>4 km</span></div><i /></div></div><div className="v-error-legend"><strong>Uncertainty Level</strong><div><i className="v-low" />Low (0 – 5%)</div><div><i className="v-medium" />Medium (5 – 15%)</div><div><i className="v-high" />High (15 – 30%)</div></div></div></Panel>; }
function ValidationTraceability() { return <Panel title="Validation Traceability" icon={Microscope} className="v-trace"><div className="v-trace-steps">{trace.map((step, index) => { const Icon = step.icon; return <div className="v-trace-step" key={step.title}><div className="v-trace-head">{step.image ? <img src={satelliteImage} alt="" /> : <Icon size={25} />}<strong>{step.title}</strong></div><ul>{step.lines.map(line => <li key={line}>{line}</li>)}</ul>{index < trace.length - 1 && <ArrowRight size={16} className="v-trace-arrow" />}</div>; })}</div><div className="v-metadata"><span><CheckCircle2 size={14} />CRS / Geospatial Metadata Preserved</span><span>EPSG:4326 (WGS 84)</span><span>Pixel size, extent and projection maintained</span></div></Panel>; }
function ValidationReportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) { const rows = [["Scene ID", "S2A_MSIL2A_20250415T053621"], ["Model", "Deep Learning (SRM)"], ["Input Resolution", "10 m"], ["Output Resolution", "~3.8 m"], ["PSNR", "34.21 dB"], ["SSIM", "0.945"], ["RMSE", "0.032"], ["SAM", "2.8°"], ["Spectral Consistency", "0.967"], ["Spatial Fidelity", "3 pass · 1 attention"], ["Uncertainty", "Low across most of the AOI"]]; return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="v-report-dialog"><DialogHeader><DialogTitle>Validation Report</DialogTitle><DialogDescription>Kanpur, Uttar Pradesh · Co-registered high-resolution reference</DialogDescription></DialogHeader><div className="v-report-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="v-report-result"><ShieldCheck size={17} />Geospatial alignment: PASS</div></DialogContent></Dialog>; }
export function ValidationPage() { const [reportOpen, setReportOpen] = useState(false); return <GeoAppShell active="Validation" subtitle="Validation & Scientific Fidelity"><main className="dashboard-content v-page"><div className="v-layout"><div className="v-left"><ThreeWayComparison /><div className="v-secondary"><SpatialFidelityChecks /><div className="v-middle"><UncertaintyMap /><aside className="v-notice"><Info size={17} /><p>Reconstructed details are inferred by the model and not directly observed in the input imagery.</p></aside></div></div></div><div className="v-right"><ValidationSummary /><SpectralComparisonChart /><PerBandMetrics /></div><div className="v-bottom"><ValidationTraceability /><div className="v-bottom-row"><p><Info size={14} />Validation compares the super-resolved product with a co-registered high-resolution reference; metrics are scene- and reference-dependent.</p><div><Button variant="surface" onClick={() => setReportOpen(true)}><FileImage size={15} />View Full Validation Report</Button><Button onClick={() => toast.success("Validation report export started")}><Download size={15} />Export Validation Report</Button></div></div></div></div><ValidationReportModal open={reportOpen} onOpenChange={setReportOpen} /></main></GeoAppShell>; }
