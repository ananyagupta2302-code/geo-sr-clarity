# GeoSR Insights

Build a modern, production-quality frontend dashboard for a satellite imagery AI platform called "GeoSR Intelligence".

IMPORTANT:
Use the uploaded dashboard screenshot as the primary visual reference. Recreate its overall layout, spacing, dark visual style, cards, typography, sidebar, map area, metrics, and processing workflow as closely as possible, while making the implementation clean and responsive.

TECH STACK:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components where useful
- Lucide React icons
- Use reusable React components
- Frontend only for now
- Use realistic mock data
- Do NOT create a backend or database

==================================================
1. OVERALL DESIGN
==================================================

Create a dark satellite/geospatial intelligence dashboard.

Theme:
- Very dark navy background
- Dark blue cards
- Cyan/teal accents
- White/light gray text
- Subtle borders
- Rounded cards
- Soft blue/cyan glow effects
- Professional AI + GIS + satellite imagery aesthetic
- High information density but clean spacing

The interface should feel like a professional geospatial AI product rather than a normal admin dashboard.

Main application name:
"GeoSR Intelligence"

Subtitle beside the logo:
"AI-Powered Super Resolution Mapping for a Sharper Tomorrow"

==================================================
2. LEFT SIDEBAR
==================================================

Create a fixed left sidebar approximately 210-220px wide on desktop.

At the top:
- Circular/globe-style logo icon
- Text: "GeoSR Intelligence"

Navigation items:

1. Dashboard
2. Imagery
3. Super Resolution
4. Compare
5. Analysis
6. Validation
7. Exports
8. Settings

Each item should have a suitable Lucide icon.

Dashboard should be the active navigation item:
- cyan/blue highlighted background
- brighter icon
- white text

At the bottom of the sidebar create a project/problem card:

"SIH 2026"
"PS No. 26142"

Title:
"Deep Learning Based Super Resolution Mapping (SRM) from Medium Resolution Satellite Imageries"

Description:
"Enhancing satellite imagery from ~10m to <4m using AI for better geospatial insights."

At the very bottom show:
"Sharper Images | Better Decisions"

==================================================
3. TOP NAVBAR
==================================================

Create a horizontal top navigation bar.

Left:
- Page/application branding

Center/right controls:

Satellite dataset dropdown:
"Sentinel-2 (10m)"

Search box:
"Search location / AOI..."

Status badge:
"● Processing Complete"

User profile:
- Circular avatar with initials "SD"
- Text "Student"
- Dropdown arrow

Keep the navbar compact and professional.

==================================================
4. MAIN DASHBOARD
==================================================

Use a responsive grid layout.

The first major row should contain:

LEFT/LARGE:
Area of Interest map section.

RIGHT:
Processing Workflow section.

FAR RIGHT:
Output Information / confidence section.

On smaller screens stack these sections vertically.

==================================================
5. AREA OF INTEREST MAP
==================================================

Create a large map card.

Header:
Location pin icon
"Area of Interest (AOI)"
Dropdown:
"Uttar Pradesh, India"

Use a satellite imagery map visual.

If an actual map library is not necessary, use a high-quality satellite-image placeholder/background and overlay GIS controls.

The map should show:
- Satellite imagery
- AOI polygon outlined in cyan
- Several polygon vertices
- Location pin in the center
- Text "Kanpur"
- Coordinates:
"26.4499° N, 80.3319° E"

Map controls on the right:
- Layers button
- Zoom +
- Zoom -
- Locate button

Top-right of map:
small mini-map preview.

Bottom:
Scale indicator:
0 — 2.5 — 5 — 10 km

The map should look interactive even though this is currently mock frontend data.

==================================================
6. PROCESSING WORKFLOW CARD
==================================================

Create a "Processing Workflow" card.

Show a horizontal workflow:

[10m Input]
Sentinel-2

→

[AI Super Resolution]
Brain/AI icon

→

[<4m Output]

Under AI Super Resolution:
"(Swin / ESRGAN / Diffusion)"

Create model selection controls:

"Model Selection"

Three selectable buttons/radio cards:
- Swin Transformer
- ESRGAN
- Diffusion Model

Default selected:
Swin Transformer

When clicked, update the selected model visually.

Below:

"Processing Progress"

Create a progress bar showing:
100%

Under it:
green success icon

"Super resolution completed successfully!"

Bottom text:
"Output resolution: ~3.8m | Processing time: 12 min 42 sec"

==================================================
7. OUTPUT INFORMATION
==================================================

Create a card titled:

"Output Information"

Show a small satellite-image thumbnail.

Information:

Input Resolution:
10 m (Sentinel-2)

Output Resolution:
~3.8 m

AOI Size:
24.6 km²

Spectral Bands:
13 (preserved)

Model Used:
Swin Transformer

Below create:

"Uncertainty / Confidence"

Large circular progress/ring indicator:
92%

Label:
"Confidence Score"

Legend:
Low Uncertainty
0–5%

Medium
5–15%

High
15–30%

Use cyan/green/orange/red indicators.

==================================================
8. BEFORE VS AFTER COMPARISON
==================================================

Create a large card titled:

"Before vs After (Super Resolution Comparison)"

Create a split image comparison.

LEFT:
Label:
"Before (10m)"

Show a blurry/low-resolution satellite image.

RIGHT:
Label:
"After (<4m)"

Show a sharper satellite image.

Add a vertical draggable comparison divider in the middle with a circular handle containing left/right arrows.

Include image controls:
- fullscreen
- zoom +
- zoom -

The comparison should visually demonstrate the improvement from 10m imagery to approximately 4m imagery.

If real satellite images are unavailable, use suitable local placeholder images or generated gradients/images, but preserve the visual appearance of the screenshot.

==================================================
9. QUALITY METRICS
==================================================

On the right side of the Before/After section create a "Quality Metrics" panel.

Create four metric cards:

1.
PSNR ↑
32.48 dB
"Higher is better"

Include a progress indicator.

2.
SSIM ↑
0.912
"Higher is better"

Include a progress indicator.

3.
Spatial Resolution ↓
3.8 m
"(from 10 m)"

Use a purple/cyan progress indicator.

4.
Spectral Consistency ↑
0.967
"(0–1)"

Use an orange progress indicator.

Each card should have a small relevant icon.

==================================================
10. GEOSPATIAL APPLICATIONS
==================================================

Create a section titled:

"Geospatial Applications"

Subtitle:
"Enable better decisions with high-resolution, AI-enhanced imagery"

Create five cards horizontally on desktop:

1. Classification
Description:
"Land use / land cover mapping with higher accuracy."

2. Change Detection
Description:
"Monitor changes in landscape over time (e.g., urban growth, deforestation)."

3. Urban Mapping
Description:
"Detect and map buildings, roads and infrastructure."

4. Crop Monitoring
Description:
"Track crop health, identify stress and estimate yield."

5. Disaster Assessment
Description:
"Assess flood, wildfire, landslide and other natural disasters."

Each card should have:
- icon
- title
- description
- "View Details →"

Use different subtle accent colors for icons while maintaining the dark theme.

==================================================
11. VALIDATION SECTION
==================================================

Create a card titled:

"Validation Against High-Resolution Reference"

Display three image thumbnails:

1. Output (SRM)
2. Reference (HR)
3. Difference Map

Below/right show metrics:

PSNR
34.21 dB

SSIM
0.945

RMSE
0.032

Add a green status badge:

"✓ Good Match"

At the bottom create a prominent button:

"Export GeoTIFF"

with download icon.

Next to it:
"View Report"

button.

==================================================
12. INTERACTIONS
==================================================

Make the frontend interactive.

Implement:

- Sidebar navigation active state
- Dataset dropdown
- Search box
- User dropdown
- Model selection
- Progress bar animation
- Before/After image comparison slider
- Map zoom controls
- Map layer toggle
- AOI selection visual state
- "View Details" buttons opening a modal or detail panel
- Export GeoTIFF button should show a toast:
  "GeoTIFF export started"
- View Report should open a report modal
- Responsive mobile sidebar
- Tooltips for map controls
- Hover effects on cards

Use toast notifications for actions.

==================================================
13. RESPONSIVE DESIGN
==================================================

Desktop:
- Fixed sidebar
- Full dashboard grid
- Multiple cards arranged horizontally

Tablet:
- Reduce sidebar width
- Cards rearrange into fewer columns

Mobile:
- Sidebar becomes a hamburger menu/drawer
- Cards stack vertically
- Workflow becomes vertical
- Quality metrics become 2-column or 1-column
- Geospatial application cards become horizontal scroll or stacked cards
- Map remains usable

Do not allow horizontal page overflow.

==================================================
14. VISUAL DETAILS
==================================================

Use:
- Dark navy backgrounds
- Cyan/teal highlights
- Blue gradients
- Subtle glassmorphism where appropriate
- 1px translucent borders
- Rounded corners around 8-12px
- Soft shadows
- Small uppercase labels where appropriate
- Clear visual hierarchy
- Compact professional typography

Avoid:
- White/light dashboard backgrounds
- Excessive gradients
- Huge headings
- Cartoon-like icons
- Generic SaaS dashboard styling
- Excessive empty space

The result should look like an advanced AI-powered satellite/geospatial analysis platform.

==================================================
15. COMPONENT STRUCTURE
==================================================

Organize the React application into reusable components such as:

DashboardLayout
Sidebar
TopNavbar
AOIMap
ProcessingWorkflow
ModelSelector
OutputInformation
ConfidenceIndicator
BeforeAfterComparison
QualityMetrics
MetricCard
GeospatialApplications
ApplicationCard
ValidationPanel
ImageViewer
ExportButton
ReportModal

Use clean TypeScript interfaces and mock data.

==================================================
16. IMPORTANT
==================================================

Do not simply copy the screenshot as a static image.

Recreate the dashboard as a real React UI with:
- real components
- buttons
- dropdowns
- progress bars
- tabs
- sliders
- modals
- responsive layouts
- hover states
- interactive controls

Use the uploaded screenshot as the visual design reference.

Make the first version polished and presentation-ready for a Smart India Hackathon project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/311ed5ab-63c5-4b68-8810-64c27ed02a43).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
