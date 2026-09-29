import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeftRight, ArrowRight, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronRight, Cloud, Database, Download, Expand, FileImage, Info, Layers3, MapPin, Minus, Plus, Scan, Satellite, Settings2, ShieldCheck, Sparkles, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GeoAppShell } from "@/components/geo-app-shell";
import satelliteImage from "@/assets/kanpur-satellite.jpg";
import { cn } from "@/lib/utils";

type Model = "Swin Transformer" | "ESRGAN" | "Diffusion Model";
type Band = "RGB" | "False Color" | "NIR";
const models = [
  { name: "Swin Transformer" as Model, description: "Best for detail preservation", icon: Sparkles },
  { name: "ESRGAN" as Model, description: "Good balance of quality and speed", icon: BrainCircuit },
  { name: "Diffusion Model" as Model, description: "Higher detail, longer processing time", icon: Scan },
];
const checks = ["Cloud Masking", "Band Alignment", "Normalization", "Tiling", "Geospatial Metadata Preservation"];
const metrics = [
  { label: "PSNR", direction: "↑", value: "34.28 dB", hint: "Higher is better", amount: 86, tone: "teal", icon: TrendingUp },
  { label: "SSIM", direction: "↑", value: "0.912", hint: "Higher is better", amount: 91, tone: "blue", icon: TrendingUp },
  { label: "RMSE", direction: "↓", value: "0.873", hint: "Lower is better", amount: 78, tone: "violet", icon: Scan },
  { label: "Spectral Consistency", direction: "↓", value: "0.967", hint: "(0 - 1)", amount: 97, tone: "amber", icon: Layers3 },
  { label: "Confidence Score", direction: "↑", value: "0.91", hint: "(0 - 1)", amount: 91, tone: "green", icon: ShieldCheck },
];

function Panel({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={cn("panel sr-panel", className)}><div className="card-heading"><h2>{title}</h2></div>{children}</section>;
}
function SelectedInputScene() {
  return <Panel title="Selected Input Scene" className="sr-scene"><div className="sr-scene-main"><img src={satelliteImage} alt="Satellite scene over Kanpur" /><div className="sr-scene-details"><strong>S2A_MSIL2A_20250415T053621</strong><span className="sr-dataset-tag">Sentinel-2</span><span><MapPin size={12} />Kanpur, Uttar Pradesh, India</span><span><CalendarDays size={12} />2025-04-15 05:36</span><span><Cloud size={12} />Cloud Cover: 8.2%</span></div></div><div className="sr-scene-meta"><span><Satellite size={12} /> Resolution: <b>10 m</b></span><span>Bands: <b>B2, B3, B4, B8 (10m)</b></span><span><FileImage size={12} /> Format: <b>GeoTIFF</b></span></div></Panel>;
}
function PreprocessingPanel() {
  const [open, setOpen] = useState(false);
  return <><Panel title="Preprocessing" className="sr-preprocess"><ul className="sr-checks">{checks.map(item => <li key={item}><CheckCircle2 size={15} fill="currentColor" /><span>{item}</span><small>Completed</small></li>)}</ul><Button variant="surface" size="sm" className="sr-details-button" onClick={() => setOpen(true)}>View Details</Button></Panel><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Preprocessing Details</DialogTitle><DialogDescription>Sentinel-2 scene S2A_MSIL2A_20250415T053621 is ready for super resolution.</DialogDescription></DialogHeader><div className="sr-modal-list">{checks.map(item => <div key={item}><CheckCircle2 size={16} /><span>{item}</span><strong>Completed</strong></div>)}</div></DialogContent></Dialog></>;
}
function ModelSelection({ model, setModel }: { model: Model; setModel: (model: Model) => void }) {
  return <Panel title="Model Selection" className="sr-models"><div role="radiogroup" aria-label="Model Selection" className="sr-model-grid">{models.map(item => { const Icon = item.icon; return <Button key={item.name} variant="surface" role="radio" aria-checked={model === item.name} className={cn("sr-model-option", model === item.name && "sr-model-selected")} onClick={() => setModel(item.name)}><Icon size={21} /><strong>{item.name}</strong><small>{item.description}</small><span className="sr-radio">{model === item.name && <Check size={10} />}</span></Button>; })}</div><p className="sr-selected-model"><Info size={13} /> Selected Model: <strong>{model}</strong></p></Panel>;
}
function ResolutionSettings({ progress, running, onRun }: { progress: number | null; running: boolean; onRun: () => void }) {
  return <Panel title="Resolution Settings" className="sr-settings"><div className="sr-resolution-grid"><div><span>Input Resolution</span><strong>10 m</strong><small>(Sentinel-2)</small></div><div><span>Scale Factor</span><strong>4×</strong><small>(Super Resolution)</small></div><div><span>Estimated Output</span><strong>2.5 m</strong><small>(&lt;4 m)</small></div></div>{progress !== null && <div className="sr-run-progress" aria-label={`Processing ${progress}%`}><span style={{ width: `${progress}%` }} /></div>}<Button className="sr-run-button" onClick={onRun} disabled={running}>{running ? `Processing... ${progress}%` : <><span aria-hidden="true">▶</span> Run Super Resolution</>}</Button>{progress === 100 && !running && <p className="sr-run-success"><CheckCircle2 size={13} />Super resolution completed successfully!</p>}</Panel>;
}
function ComparisonStage({ className }: { className?: string }) {
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const update = (x: number) => { const rect = ref.current?.getBoundingClientRect(); if (rect) setSplit(Math.max(3, Math.min(97, ((x - rect.left) / rect.width) * 100))); };
  const [fullscreen, setFullscreen] = useState(false);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => { event.currentTarget.setPointerCapture(event.pointerId); update(event.clientX); };
  return <><div ref={ref} className={cn("sr-comparison-stage", className)} style={{ "--split": `${split}%`, "--compare-zoom": zoom } as CSSProperties} onPointerDown={onPointerDown} onPointerMove={(event) => { if (event.buttons) update(event.clientX); }}><img className="sr-after-image" src={satelliteImage} alt="Enhanced satellite imagery" /><div className="sr-before-image"><img src={satelliteImage} alt="10 meter satellite imagery" /></div><span className="sr-image-label sr-label-left">Input (10 m)</span><span className="sr-image-label sr-label-right">SR Output (~2.5 m)</span><div className="sr-divider"><span><ArrowLeftRight size={16} /></span></div><div className="sr-image-tools" onPointerDown={(event) => event.stopPropagation()}><Button variant="map" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(Math.min(2, zoom + .2))}><Plus /></Button><Button variant="map" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(Math.max(1, zoom - .2))}><Minus /></Button><Button variant="map" size="icon" aria-label="Split view" title="Split view" onClick={() => setSplit(50)}><ArrowLeftRight /></Button><Button variant="map" size="icon" aria-label="Fullscreen comparison" title="Fullscreen comparison" onClick={() => setFullscreen(true)}><Expand /></Button></div><div className="sr-scale"><span>0</span><span>0.5</span><span>1</span><span>2 km</span><i /></div></div><Dialog open={fullscreen} onOpenChange={setFullscreen}><DialogContent className="sr-fullscreen-dialog"><DialogHeader><DialogTitle>Before / After Comparison</DialogTitle><DialogDescription>Drag the divider to compare input and output imagery.</DialogDescription></DialogHeader>{fullscreen && <ComparisonStage className="sr-stage-fullscreen" />}</DialogContent></Dialog></>;
}
function BeforeAfterComparison() { return <Panel title="Before / After Comparison" className="sr-comparison"><ComparisonStage /></Panel>; }
function OutputPreview() {
  const [band, setBand] = useState<Band>("RGB");
  const [fullscreen, setFullscreen] = useState(false);
  return <Panel title="Output Preview" className="sr-preview"><div className="sr-preview-tabs" role="tablist" aria-label="Output band">{(["RGB", "False Color", "NIR"] as const).map(item => <Button key={item} role="tab" aria-selected={band === item} variant={band === item ? "selected" : "surface"} onClick={() => setBand(item)}>{item}</Button>)}</div><div className={cn("sr-preview-image", `sr-band-${band.toLowerCase().replace(" ", "-")}`)}><img src={satelliteImage} alt={`${band} satellite output preview`} /><Button variant="map" size="icon" title="Fullscreen preview" aria-label="Fullscreen preview" onClick={() => setFullscreen(true)}><Expand /></Button></div><Dialog open={fullscreen} onOpenChange={setFullscreen}><DialogContent className="sr-fullscreen-dialog"><DialogHeader><DialogTitle>{band} Output Preview</DialogTitle><DialogDescription>Enhanced satellite imagery of Kanpur, Uttar Pradesh.</DialogDescription></DialogHeader><div className={cn("sr-preview-image sr-preview-fullscreen", `sr-band-${band.toLowerCase().replace(" ", "-")}`)}><img src={satelliteImage} alt={`${band} satellite output fullscreen`} /></div></DialogContent></Dialog></Panel>;
}
function QualityMetrics() { return <Panel title="Quality Metrics" className="sr-quality"><div className="sr-quality-grid">{metrics.map(metric => { const Icon = metric.icon; return <div className={cn("sr-quality-item", `tone-${metric.tone}`)} key={metric.label}><div className="sr-quality-name">{metric.label} <span>{metric.direction}</span><Icon size={15} /></div><strong>{metric.value}</strong><small>{metric.hint}</small><div className="sr-quality-track"><span style={{ width: `${metric.amount}%` }} /></div></div>; })}</div></Panel>; }
function WarningBanner() { return <aside className="sr-warning"><Info size={17} /><p>Reconstructed fine details are model-inferred and may not be actual ground truth. Please validate with high-resolution reference data and use uncertainty information for analysis.</p></aside>; }
function ProcessingWorkflow({ model }: { model: Model }) {
  const steps = [
    { name: "Input", sub: "10 m Sentinel-2", icon: FileImage },
    { name: "Pre-process", sub: "Cloud Masking + Alignment", icon: Settings2 },
    { name: "AI Super Resolution", sub: `${model} Model`, icon: BrainCircuit },
    { name: "Geospatial/Spectral Check", sub: "Consistency Validation", icon: ShieldCheck },
    { name: "Validation", sub: "vs. High-Res Reference", icon: Database },
    { name: "Export", sub: "GeoTIFF + Report", icon: Download },
  ];
  return <Panel title="Processing Workflow" className="sr-workflow"><div className="sr-workflow-row">{steps.map((step, i) => { const Icon = step.icon; return <div className={cn("sr-workflow-step", i < 2 && "sr-workflow-done", i === 2 && "sr-workflow-current")} key={step.name}><div className="sr-workflow-icon"><Icon size={19} /></div><strong>{i + 1}. {step.name}</strong><small>{step.sub}</small>{i < 5 && <ArrowRight className="sr-workflow-arrow" size={15} />}</div>; })}</div></Panel>;
}
function ActionButtons() { return <div className="sr-actions"><Button asChild variant="surface"><Link to="/compare"><Sparkles size={15} />Compare Results</Link></Button><Button asChild variant="surface"><Link to="/validation"><ShieldCheck size={15} />Validate Output</Link></Button><Button onClick={() => toast.success("GeoTIFF export started")}><Download size={15} />Export GeoTIFF</Button></div>; }
export function SuperResolutionPage() {
  const [model, setModel] = useState<Model>("ESRGAN");
  const [progress, setProgress] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setProgress(previous => { const next = Math.min(100, (previous ?? 0) + 5); if (next === 100) { window.clearInterval(timer); setRunning(false); toast.success("Super resolution completed successfully!"); } return next; }), 110); return () => window.clearInterval(timer); }, [running]);
  return <GeoAppShell active="Super Resolution"><main className="dashboard-content sr-page"><div className="sr-title-row"><div className="sr-title"><div className="sr-title-icon"><Sparkles size={24} /></div><div><h1>Super Resolution</h1><p>Enhance medium-resolution satellite imagery using deep learning models to generate high-resolution outputs<br className="sr-desktop-break" /> while preserving geographic and spectral consistency.</p></div></div><div className="sr-step-indicator"><strong>Step 3 of 6</strong><span>{running ? "AI Processing · In progress" : "AI Processing"}</span></div></div><div className="sr-top-grid"><SelectedInputScene /><PreprocessingPanel /><ModelSelection model={model} setModel={setModel} /><ResolutionSettings progress={progress} running={running} onRun={() => { setProgress(0); setRunning(true); toast.info("Super resolution processing started"); }} /></div><div className="sr-body-grid"><div className="sr-main-column"><BeforeAfterComparison /><ProcessingWorkflow model={model} /></div><div className="sr-side-column"><OutputPreview /><QualityMetrics /><WarningBanner /><ActionButtons /></div></div></main></GeoAppShell>;
}
