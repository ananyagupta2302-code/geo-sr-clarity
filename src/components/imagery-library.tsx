import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, Check, CheckCircle2, ChevronDown, Cloud, Crosshair, Download, FileImage, Image as ImageIcon, Layers3, Map, MapPin, Minus, MoreHorizontal, Plus, Search, Settings2, Sparkles, Upload, X } from "lucide-react";
import { GeoAppShell } from "@/components/geo-app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import kanpur from "@/assets/kanpur-satellite.jpg";
import farmland from "@/assets/imagery-farmland.jpg";
import river from "@/assets/imagery-river.jpg";
import coast from "@/assets/imagery-coast.jpg";

type SceneStatus = "Ready" | "Processing" | "Queued" | "Enhanced";
type Scene = { id: string; location: string; date: string; cloud: number; status: SceneStatus; image: string; satellite: string; coordinates: string; position?: string };
const initialScenes: Scene[] = [
  { id: "S2A_MSIL2A_20250415T053621", location: "Kanpur, Uttar Pradesh, India", date: "2025-04-15 05:36", cloud: 8.2, status: "Ready", image: kanpur, satellite: "Sentinel-2", coordinates: "26.4498° N, 80.3319° E" },
  { id: "S2B_MSIL2A_20250412T054631", location: "Lucknow, Uttar Pradesh, India", date: "2025-04-12 05:46", cloud: 12.4, status: "Processing", image: farmland, satellite: "Sentinel-2", coordinates: "26.8467° N, 80.9462° E" },
  { id: "S2A_MSIL2A_20250408T052621", location: "Ahmedabad, Gujarat, India", date: "2025-04-08 05:26", cloud: 4.7, status: "Ready", image: coast, satellite: "Sentinel-2", coordinates: "23.0225° N, 72.5714° E", position: "left center" },
  { id: "S2B_MSIL2A_20250405T054612", location: "Varanasi, Uttar Pradesh, India", date: "2025-04-05 05:46", cloud: 18.9, status: "Queued", image: river, satellite: "Sentinel-2", coordinates: "25.3176° N, 82.9739° E" },
  { id: "S2A_MSIL2A_20250328T052631", location: "Jaipur, Rajasthan, India", date: "2025-03-28 05:26", cloud: 6.3, status: "Ready", image: farmland, satellite: "Sentinel-2", coordinates: "26.9124° N, 75.7873° E", position: "left bottom" },
  { id: "S2B_MSIL2A_20250321T054621", location: "Patna, Bihar, India", date: "2025-03-21 05:46", cloud: 21.2, status: "Ready", image: river, satellite: "Sentinel-2", coordinates: "25.5941° N, 85.1376° E", position: "right center" },
  { id: "S2A_MSIL2A_20250318T053611", location: "Hyderabad, Telangana, India", date: "2025-03-18 05:36", cloud: 10.2, status: "Enhanced", image: kanpur, satellite: "Sentinel-2", coordinates: "17.3850° N, 78.4867° E", position: "right center" },
  { id: "S2B_MSIL2A_20250312T054631", location: "Chennai, Tamil Nadu, India", date: "2025-03-12 05:46", cloud: 7.5, status: "Ready", image: coast, satellite: "Sentinel-2", coordinates: "13.0827° N, 80.2707° E" },
  { id: "S2A_MSIL2A_20250226T053621", location: "Bhopal, Madhya Pradesh, India", date: "2025-02-26 05:36", cloud: 13.1, status: "Ready", image: farmland, satellite: "Sentinel-2", coordinates: "23.2599° N, 77.4126° E", position: "right bottom" },
  { id: "S2B_MSIL2A_20250218T054621", location: "Prayagraj, Uttar Pradesh, India", date: "2025-02-18 05:46", cloud: 16.2, status: "Processing", image: river, satellite: "Sentinel-2", coordinates: "25.4358° N, 81.8463° E", position: "left center" },
  { id: "LC08_L2SP_20250403_20250410", location: "Kolkata, West Bengal, India", date: "2025-04-03 05:46", cloud: 11.6, status: "Ready", image: coast, satellite: "Landsat 8", coordinates: "22.5726° N, 88.3639° E", position: "left center" },
  { id: "LC08_L2SP_20250205_20250212", location: "Surat, Gujarat, India", date: "2025-02-05 05:26", cloud: 9.8, status: "Queued", image: kanpur, satellite: "Landsat 8", coordinates: "21.1702° N, 72.8311° E", position: "left center" },
];
const bands = ["B2 (Blue)", "B3 (Green)", "B4 (Red)", "B8 (NIR)"];
function SceneImage({ scene, className = "" }: { scene: Scene; className?: string }) {
  return <img className={className} src={scene.image} alt={`Satellite imagery of ${scene.location}`} loading="lazy" width={1024} height={768} style={{ objectPosition: scene.position ?? "center" }} />;
}
function ImageryToolbar({ query, setQuery, dateRange, setDateRange, satellite, setSatellite, onUpload }: { query: string; setQuery: (v: string) => void; dateRange: string; setDateRange: (v: string) => void; satellite: string; setSatellite: (v: string) => void; onUpload: () => void }) {
  return <div className="panel il-toolbar"><label className="il-search"><Search size={16} /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by location, scene ID, or satellite..." aria-label="Search imagery" /></label><label className="il-filter"><CalendarDays size={16} /><span>Date Range</span><Select value={dateRange} onValueChange={setDateRange}><SelectTrigger aria-label="Date Range"><SelectValue /></SelectTrigger><SelectContent>{["Last Month", "Last 3 Months", "Last Year", "All Dates"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></label><label className="il-filter il-satellite-filter"><span>Satellite</span><Select value={satellite} onValueChange={setSatellite}><SelectTrigger aria-label="Satellite"><SelectValue /></SelectTrigger><SelectContent>{["Sentinel-2", "Landsat 8", "All Satellites"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></label><Button className="il-upload" onClick={onUpload}><Upload size={15} />Upload Imagery</Button></div>;
}
function SatelliteMap({ scene, focused }: { scene: Scene; focused: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState<"Satellite" | "Map">("Satellite");
  return <section className={cn("il-map", focused && "il-map-focus")} id="imagery-map" aria-label="Selected imagery map"><div className={cn("il-map-image", layer === "Map" && "il-map-muted")} style={{ transform: `scale(${zoom})` }}><SceneImage scene={scene} /></div><div className="il-map-overlay" /><svg className="il-polygon" viewBox="0 0 600 310" preserveAspectRatio="none" aria-label="AOI-1 boundary"><polygon points="240,105 329,77 365,163 272,205" fill="var(--aoi-fill)" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />{[[240,105],[329,77],[365,163],[272,205]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="var(--primary)" />)}</svg><div className="il-aoi-label">AOI-1</div><div className="il-map-info"><strong>Selected AOI</strong><span>Area: 24.6 km²</span><span>Coordinates:</span><span>{scene.coordinates}</span></div><div className="il-map-controls"><Button variant="map" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(v => Math.min(2, +(v + .2).toFixed(1)))}><Plus /></Button><Button variant="map" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(v => Math.max(1, +(v - .2).toFixed(1)))}><Minus /></Button><Button variant="map" size="icon" aria-label="Reset map position" title="Reset map position" onClick={() => setZoom(1)}><Crosshair /></Button></div><div className="il-map-toggle" role="group" aria-label="Map layer">{(["Map", "Satellite"] as const).map(v => <Button key={v} variant="map" aria-pressed={layer === v} className={layer === v ? "il-layer-active" : ""} onClick={() => setLayer(v)}>{v}</Button>)}</div><div className="il-scale"><div><span>0</span><span>2.5</span><span>5</span><span>10 km</span></div><i /></div></section>;
}
function ImageryCard({ scene, selected, onClick }: { scene: Scene; selected: boolean; onClick: () => void }) {
  return <article className={cn("il-scene", selected && "il-selected")}><Button variant="ghost" className="il-scene-main" aria-label={`Select ${scene.id}`} aria-pressed={selected} onClick={onClick}><div className="il-scene-image"><SceneImage scene={scene} />{selected && <span className="il-check"><Check size={14} /></span>}</div><div className="il-scene-body"><strong title={scene.id}>{scene.id}</strong><span><MapPin size={12} />{scene.location}</span><span><CalendarDays size={12} />{scene.date}</span><span><Cloud size={12} />Cloud Cover: {scene.cloud}%</span><span><Layers3 size={12} />Resolution: {scene.satellite === "Sentinel-2" ? "10 m" : "30 m"}</span><span><FileImage size={12} />Bands: B2, B3, B4, B8 (10m)</span></div></Button><div className="il-scene-footer"><span className={`il-status il-status-${scene.status.toLowerCase()}`}><CheckCircle2 size={11} />{scene.status}</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`More options for ${scene.id}`}><MoreHorizontal size={16} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onClick}>View details</DropdownMenuItem><DropdownMenuItem onClick={() => toast.info(`${scene.id} selected for processing`)}>Select for processing</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></article>;
}
function ImageryGrid({ scenes, selectedId, onSelect, sort, setSort }: { scenes: Scene[]; selectedId: string; onSelect: (id: string) => void; sort: string; setSort: (v: string) => void }) {
  return <section className="panel il-library"><div className="il-library-head"><h2>Available Imagery ({scenes.length})</h2><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort imagery"><span>Sort by:</span><SelectValue /></SelectTrigger><SelectContent>{["Newest", "Oldest", "Lowest Cloud Cover"].map(v => <SelectItem value={v} key={v}>{v}</SelectItem>)}</SelectContent></Select></div>{scenes.length ? <div className="il-grid">{scenes.map(scene => <ImageryCard key={scene.id} scene={scene} selected={selectedId === scene.id} onClick={() => onSelect(scene.id)} />)}</div> : <div className="il-empty">No imagery matches these filters. Try a different search or date range.</div>}</section>;
}
function MetadataList({ scene }: { scene: Scene }) {
  const rows = [["Satellite",scene.satellite],["Resolution",scene.satellite === "Sentinel-2" ? "10 m" : "30 m"],["Product Type","Multispectral"],["Cloud Cover",`${scene.cloud}%`],["File Format","GeoTIFF"],["Bands","B2, B3, B4, B8 (10m)"],["Coordinates",scene.coordinates]];
  return <div className="il-metadata"><h3>Metadata</h3><dl>{rows.map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div>;
}
function SpectralBands({ scene }: { scene: Scene }) {
  return <div className="il-bands"><h3>Spectral Bands Preview</h3><div className="il-band-grid">{bands.map((name,i) => <div key={name}><div className={`il-band-image il-band-${i}`}><SceneImage scene={scene} /></div><span>{name}</span></div>)}</div></div>;
}
function ImageQuality({ scene }: { scene: Scene }) {
  const score = Math.max(60, Math.round(99 - scene.cloud));
  return <div className="il-quality"><h3>Image Quality</h3><div className="il-quality-content"><div className="il-quality-ring" style={{ "--quality": `${score}%` } as React.CSSProperties}><strong>{score}%</strong></div><div><strong>Good Quality</strong><span><Check size={12} />Low Cloud Cover</span><span><Check size={12} />Clear Visibility</span><span><Check size={12} />Suitable for Processing</span></div></div></div>;
}
function SceneDetails({ scene, onMap, onPreprocess, onSuperResolution, busy }: { scene: Scene; onMap: () => void; onPreprocess: () => void; onSuperResolution: () => void; busy: "preprocess" | "super-resolution" | null }) {
  return <aside className="panel il-details"><div className="il-details-head"><h2>Scene Details</h2><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Scene options"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => toast.info(`${scene.id} selected`)}>Copy scene reference</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="il-details-summary"><SceneImage scene={scene} /><div><strong title={scene.id}>{scene.id}</strong><span className={`il-status il-status-${scene.status.toLowerCase()}`}><CheckCircle2 size={11} />{scene.status}</span><p><MapPin size={13} />{scene.location}</p><p><CalendarDays size={13} />{scene.date}</p></div></div><MetadataList scene={scene} /><div className="il-actions"><Button variant="outline" onClick={onMap}><Map size={15} />View on Map</Button><Button variant="surface" disabled={busy !== null} onClick={onPreprocess}><Settings2 size={15} />{busy === "preprocess" ? "Pre-processing..." : "Pre-process"}</Button><Button disabled={busy !== null} onClick={onSuperResolution}><Sparkles size={15} />{busy === "super-resolution" ? "Preparing imagery..." : "Run Super Resolution"}</Button></div><SpectralBands scene={scene} /><ImageQuality scene={scene} /></aside>;
}
function UploadImageryModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (v: boolean) => void; onAdd: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="il-upload-dialog"><DialogHeader><DialogTitle>Upload Imagery</DialogTitle><DialogDescription>Add an image to this local preview. No file is sent to a server.</DialogDescription></DialogHeader><div className="il-dropzone"><FileImage size={32} /><p>Choose a satellite image to add to the library</p><small>JPG, PNG or WebP</small><Input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose imagery file" onChange={e => { const file = e.target.files?.[0]; if (file) { onAdd(file); e.target.value = ""; } }} /><Button onClick={() => input.current?.click()}><Upload size={15} />Choose image</Button></div></DialogContent></Dialog>;
}
export function ImageryLibrary() {
  const [scenes, setScenes] = useState(initialScenes);
  const [selectedId, setSelectedId] = useState(initialScenes[0].id);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState("Last 3 Months");
  const [satellite, setSatellite] = useState("Sentinel-2");
  const [sort, setSort] = useState("Newest");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState<"preprocess" | "super-resolution" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uploadedUrls = useRef<string[]>([]);
  const navigate = useNavigate();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); uploadedUrls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const filtered = useMemo(() => {
    const cutoff = dateRange === "Last Month" ? "2025-03-15" : dateRange === "Last 3 Months" ? "2025-01-15" : dateRange === "Last Year" ? "2024-04-15" : "";
    return scenes.filter(scene => (satellite === "All Satellites" || scene.satellite === satellite) && scene.date >= cutoff && `${scene.id} ${scene.location} ${scene.satellite}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a,b) => sort === "Lowest Cloud Cover" ? a.cloud - b.cloud : sort === "Oldest" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }, [scenes, query, dateRange, satellite, sort]);
  const scene = filtered.find(item => item.id === selectedId) ?? filtered[0] ?? scenes.find(item => item.id === selectedId) ?? scenes[0];
  function run(kind: "preprocess" | "super-resolution") { setBusy(kind); toast.info(kind === "preprocess" ? "Pre-processing imagery..." : "Preparing imagery for super resolution..."); timer.current = setTimeout(() => { setBusy(null); toast.success(kind === "preprocess" ? "Pre-processing completed for selected scene" : "Imagery ready for super resolution"); if (kind === "super-resolution") navigate({ to: "/super-resolution" }); }, 1600); }
  function addFile(file: File) { if (!file.type.startsWith("image/")) { toast.error("Choose an image file"); return; } const url = URL.createObjectURL(file); uploadedUrls.current.push(url); const item: Scene = { id: `LOCAL_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g,"_")}`, location: "Uploaded imagery", date: "2025-04-15 05:36", cloud: 0, status: "Ready", image: url, satellite: "Sentinel-2", coordinates: "26.4498° N, 80.3319° E" }; setScenes(previous => [item,...previous]); setQuery(""); setDateRange("All Dates"); setSatellite("All Satellites"); setSelectedId(item.id); setUploadOpen(false); toast.success(`${file.name} added to the preview`); }
  return <GeoAppShell active="Imagery"><main className="dashboard-content il-page"><div className="il-heading"><ImageIcon size={25} /><div><h1>Imagery Library</h1><p>Browse, manage and process satellite imagery for super resolution mapping.</p></div></div><div className="il-layout"><div className="il-main"><ImageryToolbar query={query} setQuery={setQuery} dateRange={dateRange} setDateRange={setDateRange} satellite={satellite} setSatellite={setSatellite} onUpload={() => setUploadOpen(true)} /><SatelliteMap scene={scene} focused={focused} /><ImageryGrid scenes={filtered} selectedId={scene.id} onSelect={id => { setSelectedId(id); setFocused(false); }} sort={sort} setSort={setSort} /></div><SceneDetails scene={scene} busy={busy} onMap={() => { setFocused(true); document.getElementById("imagery-map")?.scrollIntoView({ behavior: "smooth", block: "center" }); toast.info(`${scene.location} shown on map`); }} onPreprocess={() => run("preprocess")} onSuperResolution={() => run("super-resolution")} /></div><UploadImageryModal open={uploadOpen} onOpenChange={setUploadOpen} onAdd={addFile} /></main></GeoAppShell>;
}
