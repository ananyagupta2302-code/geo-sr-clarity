# Export workspace

## Build
- Add a new `/export` page inside the existing GeoSR shell and make Export the active sidebar destination.
- Recreate the reference layout with export tabs, four configuration sections, summary, recent exports, and GIS information notice.
- Use the existing Kanpur imagery, shared controls, typography, colors, spacing, icons, dialogs, and toasts.

## Interactions
- Keep export type, format, resolution, included options, AOI, bands, and filename in React state.
- Update the summary and estimated size from those selections.
- Simulate export preparation and completion, add the result to recent exports, and provide download notifications.
- Add an AOI dialog and responsive desktop, tablet, and mobile layouts.

## Verification
- Confirm the new route has unique page metadata and does not alter existing page content.
- Check the desktop and mobile layouts, navigation, selection controls, dialog, and export flow in the live preview.
