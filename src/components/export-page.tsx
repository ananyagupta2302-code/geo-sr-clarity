import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3, Check, CheckCircle2, ChevronDown, Download, FileArchive, FileJson,
  FileText, Image as ImageIcon, Info, Layers3, MapPin, Pencil, Satellite,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GeoAppShell } from "@/components/geo-app-shell";
import satelliteImage from "@/assets/kanpur-satellite.jpg";
import { cn } from "@/lib/utils";

type ExportType = "Super-Resolved Image" | "Validation Report" | "Comparison Package";
type RecentExport = { name: string; type: string; size: string; date: string; icon: typeof ImageIcon; tone: string };

const exportTabs = [
  { label: "Super-Resolved Image", icon: ImageIcon },
  { label: "Validation Report", icon: BarChart3 },
  { label: "Comparison Package", icon: FileArchive },
  { label: "Analysis Results", icon: Layers3 },
  { label: "Metadata", icon: FileText },
];
const exportTypes: { label: ExportType; description: string; icon: typeof ImageIcon }[] = [
  { label: "Super-Resolved Image", description: "Export enhanced satellite image (GeoTIFF)", icon: ImageIcon },
  { label: "Validation Report", description: "Export quality metrics and validation results (PDF)", icon: FileText },
  { label: "Comparison Package", description: "Export input, SR, reference, error map (ZIP)", icon: FileArchive },
];
const initialExports: RecentExport[] = [
  { name: "Kanpur_SR_10m_to_4m_2026-09-24.tif", type: "GeoTIFF", size: "842 MB", date: "24 Sep 2026, 10:14 AM", icon: ImageIcon, tone: "cyan" },
  { name: "Validation_Report_2026-09-24.pdf", type: "PDF", size: "2.4 MB", date: "24 Sep 2026, 09:48 AM", icon: FileText, tone: "violet" },
  { name: "Comparison_Package_2026-09-23.zip", type: "ZIP", size: "1.2 GB", date: "23 Sep 2026, 06:22 PM", icon: FileArchive, tone: "blue" },
  { name: "Analysis_Results_2026-09-22.csv", type: "CSV", size: "8.6 MB", date: "22 Sep 2026, 05:17 PM", icon: BarChart3, tone: "green" },
  { name: "Metadata_Kanpur_2026-09-22.json", type: "JSON", size: "12 KB", date: "22 Sep 2026, 05:10 PM", icon: FileJson, tone: "teal" },
];
const aoiOptions = ["Kanpur, Uttar Pradesh, India", "Lucknow, Uttar Pradesh, India", "Varanasi, Uttar Pradesh, India"];
const bandOptions = ["B2 - Blue", "B3 - Green", "B4 - Red", "B8 - Near Infrared"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel ex-section"><h2>{title}</h2>{children}</section>;
}

function ExportHeader({ tab, setTab }: { tab: string; setTab: (tab: string) => void }) {
  return <section className="panel ex-header"><div className="ex-heading"><span><Download size={27} /></span><div><h1>Export</h1><p>Download your results, reports and data in your preferred format.</p></div></div><div className="ex-tabs" role="tablist">{exportTabs.map(({ label, icon: Icon }) => <Button key={label} variant={tab === label ? "selected" : "surface"} role="tab" aria-selected={tab === label} onClick={() => setTab(label)}><Icon size={15} />{label}</Button>)}</div></section>;
}

function ExportTypeSection({ value, onChange }: { value: ExportType; onChange: (value: ExportType) => void }) {
  return <Section title="1. Select Export Type"><div className="ex-type-grid" role="radiogroup">{exportTypes.map(({ label, description, icon: Icon }) => <Button key={label} variant="surface" role="radio" aria-checked={value === label} className={cn("ex-type-card", value === label && "ex-selected")} onClick={() => onChange(label)}><span className="ex-type-icon"><Icon /></span><span><strong>{label}</strong><small>{description}</small></span><i>{value === label && <Check size={10} />}</i></Button>)}</div></Section>;
}

function SelectControl({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="ex-field"><span>{label}</span><div className="ex-select-wrap"><select value={value} onChange={event => onChange(event.target.value)}>{children}</select><ChevronDown size={13} /></div></label>;
}

function FormatOptions({ format, setFormat, resolution, setResolution, includes, toggleInclude }: { format: string; setFormat: (v: string) => void; resolution: string; setResolution: (v: string) => void; includes: string[]; toggleInclude: (v: string) => void }) {
  const options = ["Geospatial Metadata (CRS, coordinates, etc.)", "Quality Metrics (PSNR, SSIM, RMSE, etc.)", "AOI Information"];
  return <Section title="2. Choose Format & Options"><div className="ex-options-grid"><SelectControl label="File Format" value={format} onChange={setFormat}>{["GeoTIFF (.tif)", "PNG (.png)", "JPEG (.jpg)"].map(item => <option key={item}>{item}</option>)}</SelectControl><SelectControl label="Resolution" value={resolution} onChange={setResolution}>{["< 4m (High-Res)", "4m", "10m", "Original Resolution"].map(item => <option key={item}>{item}</option>)}</SelectControl><fieldset className="ex-includes"><legend>Include</legend>{options.map(item => <label key={item}><input type="checkbox" checked={includes.includes(item)} onChange={() => toggleInclude(item)} /><span><Check size={11} /></span>{item}</label>)}</fieldset></div></Section>;
}

function AreaBands({ aoi, setAoiOpen, bands, setBands }: { aoi: string; setAoiOpen: (v: boolean) => void; bands: string; setBands: (v: string) => void }) {
  return <Section title="3. Select Area & Bands"><div className="ex-area-grid"><div className="ex-field"><span>Area of Interest (AOI)</span><div className="ex-aoi-field"><MapPin size={14} /><span>{aoi}</span><Button variant="surface" onClick={() => setAoiOpen(true)}>Change</Button></div><small>Selected Area: 26.4499° N, 80.3319° E&nbsp; | &nbsp;~ 18.6 km²</small></div><SelectControl label="Spectral Bands" value={bands} onChange={setBands}><option>All Bands (B2, B3, B4, B8)</option>{bandOptions.map(item => <option key={item}>{item}</option>)}</SelectControl><small className="ex-band-count">({bands.startsWith("All") ? "4 bands" : "1 band"} selected)</small></div></Section>;
}

function PreviewExport({ filename, setFilename, size, status, onExport, buttonLabel }: { filename: string; setFilename: (v: string) => void; size: string; status: "idle" | "loading" | "complete"; onExport: () => void; buttonLabel: string }) {
  return <Section title="4. Preview & Export"><div className="ex-preview-grid"><div className="ex-preview"><img src={satelliteImage} alt="Kanpur satellite export preview" /><span className="ex-aoi-outline" /></div><div className="ex-output"><label className="ex-field"><span>Output File Name</span><div className="ex-name-input"><input value={filename} onChange={event => setFilename(event.target.value)} aria-label="Output file name" /><Pencil size={13} /></div></label><div className="ex-size"><span>File Size (approx.)</span><strong><FileText size={15} />{size}</strong></div><Button className={cn("ex-export-button", status === "complete" && "ex-complete")} onClick={onExport} disabled={status === "loading"}>{status === "complete" ? <CheckCircle2 /> : <Download />}{status === "loading" ? "Preparing Export..." : status === "complete" ? "Export Complete" : `Export ${buttonLabel}`}</Button></div></div></Section>;
}

function ExportSummary({ type, format, resolution, aoi, bands, includes, size }: { type: ExportType; format: string; resolution: string; aoi: string; bands: string; includes: string[]; size: string }) {
  const includeLabel = includes.length ? includes.map(item => item.startsWith("Geospatial") ? "Metadata" : item.startsWith("Quality") ? "Quality Metrics" : "AOI").join(" + ") : "None";
  const rows = [["Export Type", type], ["Format", format], ["Resolution", resolution], ["AOI", aoi], ["Bands", bands.replace("All Bands (", "").replace(")", " (All)")], ["Include", includeLabel], ["Estimated File Size", size]];
  return <section className="panel ex-summary"><div className="ex-card-title"><span><Download size={18} /></span><h2>Export Summary</h2><b><CheckCircle2 size={12} />Ready to Export</b></div><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function RecentExports({ items }: { items: RecentExport[] }) {
  return <section className="panel ex-recent"><div className="ex-card-title"><span><Download size={18} /></span><h2>Recent Exports</h2><Button variant="link" onClick={() => toast.info("Showing the latest exports")}>View All</Button></div><div className="ex-recent-list">{items.slice(0, 5).map((item, index) => { const Icon = item.icon; return <article key={`${item.name}-${index}`}><span className={cn("ex-file-icon", `ex-tone-${item.tone}`)}><Icon size={20} /></span><div><strong>{item.name}</strong><p>{item.type}&nbsp; | &nbsp;{item.size}</p><small>{item.date}</small></div><Button variant="map" size="icon" aria-label={`Download ${item.name}`} title="Download" onClick={() => toast.success(`Download started: ${item.name}`)}><Download size={15} /></Button></article>; })}</div></section>;
}

export function ExportPage() {
  const [tab, setTab] = useState("Super-Resolved Image");
  const [type, setType] = useState<ExportType>("Super-Resolved Image");
  const [format, setFormat] = useState("GeoTIFF (.tif)");
  const [resolution, setResolution] = useState("< 4m (High-Res)");
  const [includes, setIncludes] = useState(["Geospatial Metadata (CRS, coordinates, etc.)", "Quality Metrics (PSNR, SSIM, RMSE, etc.)", "AOI Information"]);
  const [aoi, setAoi] = useState("Kanpur, Uttar Pradesh, India");
  const [bands, setBands] = useState("All Bands (B2, B3, B4, B8)");
  const [filename, setFilename] = useState("Kanpur_SR_10m_to_4m_2026-09-24.tif");
  const [aoiOpen, setAoiOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "complete">("idle");
  const [recent, setRecent] = useState(initialExports);
  const size = useMemo(() => { const base = format.startsWith("GeoTIFF") ? 842 : format.startsWith("PNG") ? 318 : 96; const scale = resolution.startsWith("<") ? 1 : resolution === "4m" ? .86 : resolution === "10m" ? .28 : .42; const bandScale = bands.startsWith("All") ? 1 : .3; return `${Math.round(base * scale * bandScale)} MB`; }, [format, resolution, bands]);
  const extension = format.startsWith("GeoTIFF") ? "GeoTIFF" : format.startsWith("PNG") ? "PNG" : "JPEG";
  const toggleInclude = (item: string) => setIncludes(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  const handleType = (next: ExportType) => { setType(next); setTab(next); setStatus("idle"); };
  const handleExport = () => { setStatus("loading"); window.setTimeout(() => { setStatus("complete"); setRecent(current => [{ name: filename, type: extension, size, date: "Just now", icon: type === "Validation Report" ? FileText : type === "Comparison Package" ? FileArchive : ImageIcon, tone: "cyan" }, ...current]); toast.success("Export complete", { description: `${filename} is ready to download.` }); }, 1300); };
  return <GeoAppShell active="Export"><main className="dashboard-content ex-page"><ExportHeader tab={tab} setTab={value => { setTab(value); if (value === "Super-Resolved Image" || value === "Validation Report" || value === "Comparison Package") setType(value); }} /><div className="ex-layout"><div className="ex-main"><ExportTypeSection value={type} onChange={handleType} /><FormatOptions format={format} setFormat={setFormat} resolution={resolution} setResolution={setResolution} includes={includes} toggleInclude={toggleInclude} /><AreaBands aoi={aoi} setAoiOpen={setAoiOpen} bands={bands} setBands={setBands} /><PreviewExport filename={filename} setFilename={setFilename} size={size} status={status} onExport={handleExport} buttonLabel={extension} /></div><aside className="ex-side"><ExportSummary type={type} format={format} resolution={resolution} aoi={aoi} bands={bands} includes={includes} size={size} /><RecentExports items={recent} /><div className="ex-info"><Info size={17} /><p>Exported files retain geospatial information and can be used in GIS software (QGIS, ArcGIS, etc.), research and reporting.</p></div></aside></div><Dialog open={aoiOpen} onOpenChange={setAoiOpen}><DialogContent className="ex-aoi-dialog"><DialogHeader><DialogTitle>Change Area of Interest</DialogTitle><DialogDescription>Select an available mock area for this export.</DialogDescription></DialogHeader><div>{aoiOptions.map(option => <Button key={option} variant={aoi === option ? "selected" : "surface"} onClick={() => { setAoi(option); setAoiOpen(false); toast.success("Area of interest updated"); }}><MapPin size={15} />{option}</Button>)}</div></DialogContent></Dialog></main></GeoAppShell>;
}
