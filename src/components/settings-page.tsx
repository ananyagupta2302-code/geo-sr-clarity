import { useEffect, useState, type ComponentType } from "react";
import { Bell, BrainCircuit, Database, Mail, Map as MapIcon, Moon, RotateCcw, Save, Settings2, SlidersHorizontal, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import { GeoAppShell } from "@/components/geo-app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import satelliteImage from "@/assets/kanpur-satellite.jpg";
import { cn } from "@/lib/utils";

type Settings = {
  language: string; timezone: string; dateFormat: string; theme: string; density: string; autoSave: boolean;
  prefix: string; outputFormat: string; mapStyle: string; zoom: string; coordinates: string; grid: boolean;
  scaleBar: boolean; northArrow: boolean; projection: string; satellite: string; model: string;
  tileSize: string; resolution: string; cache: boolean; cacheSize: string;
  processingAlerts: boolean; systemUpdates: boolean; highResAlerts: boolean; email: string;
};
const defaults: Settings = {
  language: "English", timezone: "(GMT +5:30) India Standard Time", dateFormat: "DD-MM-YYYY", theme: "Dark", density: "Compact", autoSave: true,
  prefix: "SIH_26142", outputFormat: "GeoTIFF (.tif)", mapStyle: "Satellite", zoom: "10 (City Level)", coordinates: "Decimal Degrees (DD)", grid: true,
  scaleBar: true, northArrow: false, projection: "WGS 84 (EPSG:4326)", satellite: "Sentinel-2 (10m)", model: "ESRGAN",
  tileSize: "1024 × 1024", resolution: "< 4m (High Res)", cache: true, cacheSize: "5 GB",
  processingAlerts: true, systemUpdates: true, highResAlerts: false, email: "",
};
const storageKey = "geosr-settings-v1";
type Category = "General" | "AI & Model" | "Map & Display" | "Data & Storage" | "Processing" | "Notifications" | "Account";
const categories: { name: Category; icon: ComponentType<{ size?: number }> }[] = [
  { name: "General", icon: Settings2 }, { name: "AI & Model", icon: BrainCircuit },
  { name: "Map & Display", icon: MapIcon }, { name: "Data & Storage", icon: Database },
  { name: "Processing", icon: SlidersHorizontal }, { name: "Notifications", icon: Bell },
  { name: "Account", icon: UserRound },
];

function SettingsCard({ title, subtitle, icon: Icon, children, className }: { title: string; subtitle?: string; icon: ComponentType<{ size?: number }>; children: React.ReactNode; className?: string }) {
  return <section className={cn("panel st-card", className)}><header className="st-card-head"><Icon size={21} /><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></header>{children}</section>;
}
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="st-section"><h3>{title}</h3>{children}</div>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="st-field"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger className="st-select" aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>;
}
function ToggleSwitch({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="st-toggle"><Switch checked={checked} onCheckedChange={onChange} aria-label={label} /><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>;
}
function RadioOption({ label, selected, onClick, icon: Icon }: { label: string; selected: boolean; onClick: () => void; icon?: ComponentType<{ size?: number }> }) {
  return <Button type="button" variant="surface" role="radio" aria-checked={selected} className={cn("st-radio-option", selected && "st-chosen")} onClick={onClick}>{Icon ? <Icon size={16} /> : <span className="st-radio-dot" />}{label}</Button>;
}
function MapStyleSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="st-map-options" role="radiogroup" aria-label="Base Map Style">{["Satellite", "Street", "Topographic", "Dark"].map(style => <Button type="button" variant="ghost" role="radio" aria-checked={style === value} key={style} className="st-map-choice" onClick={() => onChange(style)}><span className={cn("st-map-thumbnail", `st-map-${style.toLowerCase()}`, style === value && "st-map-active")}>{style === "Satellite" && <img src={satelliteImage} alt="" />}</span><span className="st-map-caption"><i className={cn("st-radio-dot", value === style && "st-dot-active")} />{style}</span></Button>)}</div>;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [category, setCategory] = useState<Category>("General");
  useEffect(() => { try { const saved = localStorage.getItem(storageKey); if (saved) { const parsed = JSON.parse(saved); if (parsed && typeof parsed === "object") setSettings({ ...defaults, ...parsed }); } } catch { /* Use defaults when local settings are unavailable. */ } }, []);
  function update<K extends keyof Settings>(key: K, value: Settings[K]) { setSettings(previous => ({ ...previous, [key]: value })); }
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(settings)); toast.success("Settings saved successfully."); } catch { toast.error("Settings could not be saved on this device."); } }
  function reset() { setSettings(defaults); try { localStorage.removeItem(storageKey); } catch { /* Defaults still apply for this session. */ } toast.success("Settings reset to default."); }
  const select = <K extends keyof Settings>(key: K) => (value: string) => update(key, value as Settings[K]);
  const toggle = <K extends keyof Settings>(key: K) => (value: boolean) => update(key, value as Settings[K]);
  const general = <SettingsCard title="General Settings" subtitle="Configure basic application preferences." icon={Settings2} className="st-general">
    <SettingsSection title="Language & Region"><div className="st-two-fields"><SelectField label="Language" value={settings.language} options={["English", "हिन्दी"]} onChange={select("language")} /><SelectField label="Time Zone" value={settings.timezone} options={["(GMT +5:30) India Standard Time", "(GMT +0:00) UTC", "(GMT -5:00) Eastern Time"]} onChange={select("timezone")} /></div><SelectField label="Date Format" value={settings.dateFormat} options={["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"]} onChange={select("dateFormat")} /></SettingsSection>
    <SettingsSection title="Appearance"><div className="st-appearance"><div><span className="st-field-label">Theme</span><div className="st-option-row" role="radiogroup" aria-label="Theme"><RadioOption label="Dark" icon={Moon} selected={settings.theme === "Dark"} onClick={() => update("theme", "Dark")} /><RadioOption label="Light" icon={Sun} selected={settings.theme === "Light"} onClick={() => update("theme", "Light")} /></div></div><div><span className="st-field-label">Interface Density</span><div className="st-option-row" role="radiogroup" aria-label="Interface Density">{["Compact", "Default", "Comfortable"].map(density => <RadioOption key={density} label={density} selected={settings.density === density} onClick={() => update("density", density)} />)}</div></div></div></SettingsSection>
    <SettingsSection title="Auto-Save"><ToggleSwitch label="Save project progress automatically" description="Your work will be saved every 5 minutes." checked={settings.autoSave} onChange={toggle("autoSave")} /></SettingsSection>
    <SettingsSection title="Default Project Settings"><div className="st-two-fields"><label className="st-field"><span>Project Name Prefix</span><Input value={settings.prefix} onChange={e => update("prefix", e.target.value)} /></label><SelectField label="Default Output Format" value={settings.outputFormat} options={["GeoTIFF (.tif)", "PNG (.png)", "JPEG (.jpg)"]} onChange={select("outputFormat")} /></div></SettingsSection>
    <SettingsSection title="System Information"><dl className="st-system"><div><dt>Application Version</dt><dd>v1.0.0</dd></div><div><dt>Build Number</dt><dd>26142</dd></div><div><dt>Last Updated</dt><dd>21 Sep 2026, 10:24 AM</dd></div></dl></SettingsSection>
  </SettingsCard>;
  const map = <SettingsCard title="Map & Display Settings" subtitle="Control how maps and layers are displayed." icon={MapIcon}><div className="st-card-content"><span className="st-field-label">Base Map Style</span><MapStyleSelector value={settings.mapStyle} onChange={select("mapStyle")} /><div className="st-two-fields"><SelectField label="Default Zoom Level" value={settings.zoom} options={["6 (Region Level)", "10 (City Level)", "14 (Street Level)"]} onChange={select("zoom")} /><SelectField label="Coordinate Format" value={settings.coordinates} options={["Decimal Degrees (DD)", "Degrees Minutes Seconds (DMS)"]} onChange={select("coordinates")} /></div><div className="st-toggle-row"><ToggleSwitch label="Show Grid" checked={settings.grid} onChange={toggle("grid")} /><ToggleSwitch label="Show Scale Bar" checked={settings.scaleBar} onChange={toggle("scaleBar")} /><ToggleSwitch label="Show North Arrow" checked={settings.northArrow} onChange={toggle("northArrow")} /></div><SelectField label="Map Projection" value={settings.projection} options={["WGS 84 (EPSG:4326)", "Web Mercator (EPSG:3857)", "UTM Zone 44N (EPSG:32644)"]} onChange={select("projection")} /></div></SettingsCard>;
  const data = <SettingsCard title="Data & Processing Settings" subtitle="Configure data sources and processing preferences." icon={Database}><div className="st-card-content"><div className="st-two-fields"><SelectField label="Default Satellite" value={settings.satellite} options={["Sentinel-2 (10m)", "Landsat 8 (30m)", "Sentinel-1 (10m)"]} onChange={select("satellite")} /><SelectField label="Super Resolution Model" value={settings.model} options={["ESRGAN", "Swin Transformer", "Diffusion Model"]} onChange={select("model")} /><SelectField label="Processing Tile Size" value={settings.tileSize} options={["512 × 512", "1024 × 1024", "2048 × 2048"]} onChange={select("tileSize")} /><SelectField label="Output Resolution" value={settings.resolution} options={["< 4m (High Res)", "2.5m (Ultra High Res)", "5m (Standard)"]} onChange={select("resolution")} /></div><div className="st-two-fields st-cache"><ToggleSwitch label="Cache Data" description="Store tiles locally for faster loading" checked={settings.cache} onChange={toggle("cache")} /><SelectField label="Cache Size Limit" value={settings.cacheSize} options={["1 GB", "5 GB", "10 GB", "20 GB"]} onChange={select("cacheSize")} /></div></div></SettingsCard>;
  const notifications = <SettingsCard title="Email/Notification Settings" subtitle="Manage alerts and update preferences." icon={Bell}><div className="st-card-content"><div className="st-toggle-row"><ToggleSwitch label="Processing Complete" checked={settings.processingAlerts} onChange={toggle("processingAlerts")} /><ToggleSwitch label="System Updates" checked={settings.systemUpdates} onChange={toggle("systemUpdates")} /><ToggleSwitch label="< 4m (High Res)" checked={settings.highResAlerts} onChange={toggle("highResAlerts")} /></div><label className="st-field"><span>Email Notifications</span><span className="st-email"><Mail size={15} /><Input type="email" value={settings.email} onChange={e => update("email", e.target.value)} placeholder="Enter your email address" /></span></label></div></SettingsCard>;
  const categoryContents: Record<Category, React.ReactNode> = {
    General: <><div className="st-main-col">{general}</div><div className="st-side-col">{map}{data}{notifications}</div></>,
    "AI & Model": <div className="st-single-col"><SettingsCard title="AI & Model" subtitle="Model preferences for super-resolution processing." icon={BrainCircuit}><div className="st-card-content st-two-fields"><SelectField label="Super Resolution Model" value={settings.model} options={["ESRGAN", "Swin Transformer", "Diffusion Model"]} onChange={select("model")} /><SelectField label="Output Resolution" value={settings.resolution} options={["< 4m (High Res)", "2.5m (Ultra High Res)", "5m (Standard)"]} onChange={select("resolution")} /></div></SettingsCard></div>,
    "Map & Display": <div className="st-single-col">{map}</div>,
    "Data & Storage": <div className="st-single-col">{data}</div>,
    Processing: <div className="st-single-col"><SettingsCard title="Processing" subtitle="Default processing preferences." icon={SlidersHorizontal}><div className="st-card-content st-two-fields"><SelectField label="Processing Tile Size" value={settings.tileSize} options={["512 × 512", "1024 × 1024", "2048 × 2048"]} onChange={select("tileSize")} /><ToggleSwitch label="Cache Data" description="Store tiles locally for faster loading" checked={settings.cache} onChange={toggle("cache")} /><ToggleSwitch label="Auto-Save" description="Save project progress automatically" checked={settings.autoSave} onChange={toggle("autoSave")} /></div></SettingsCard></div>,
    Notifications: <div className="st-single-col">{notifications}</div>,
    Account: <div className="st-single-col"><SettingsCard title="Account" subtitle="Local preferences for this project." icon={UserRound}><div className="st-card-content st-two-fields"><label className="st-field"><span>Project Name Prefix</span><Input value={settings.prefix} onChange={e => update("prefix", e.target.value)} /></label><label className="st-field"><span>Email Notifications</span><Input type="email" value={settings.email} onChange={e => update("email", e.target.value)} placeholder="Enter your email address" /></label></div></SettingsCard></div>,
  };
  return <GeoAppShell active="Settings"><main className={cn("dashboard-content st-page", settings.theme === "Light" && "st-light", `st-density-${settings.density.toLowerCase()}`)}><header className="panel st-page-head"><Settings2 size={26} /><div><h1>Settings</h1><p>Manage your application preferences, model configuration and system settings.</p></div></header><div className="st-layout"><nav className="panel st-nav" aria-label="Settings categories">{categories.map(({ name, icon: Icon }) => <Button key={name} variant="ghost" className={cn("st-nav-item", category === name && "st-nav-active")} aria-current={category === name ? "page" : undefined} onClick={() => setCategory(name)}><Icon size={19} /><span>{name}</span></Button>)}</nav><div className="st-content"><div className="st-panels">{categoryContents[category]}</div><div className="st-actions"><Button variant="surface" onClick={reset}><RotateCcw size={15} />Reset to Default</Button><Button onClick={save}><Save size={15} />Save Changes</Button></div></div></div></main></GeoAppShell>;
}