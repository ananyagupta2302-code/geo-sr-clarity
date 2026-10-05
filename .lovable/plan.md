# Compare Imagery workspace

## Build
- Replace the current basic `/compare` destination with a dedicated Compare Imagery module inside the existing GeoSR shell.
- Match the supplied desktop reference with a dense central comparison workspace and fixed-width metrics rail, using the existing imagery, tokens, buttons, dialogs, typography, and icons.
- Keep Dashboard, Imagery, Super Resolution, Validation, Export, and Settings independent and unchanged.

## Interactions
- Add scene, location, resolution, and acquisition controls using realistic linked mock selections.
- Support draggable swipe comparison, split view, overlay mode with opacity, zoom controls, fullscreen viewing, and selectable image previews.
- Add Quantitative and Spectral tabs, report generation, GeoTIFF export feedback, notification and user menus through the shared header.

## Responsive behavior
- Keep the three-column desktop composition; stack the metrics rail below the viewer on tablets.
- Collapse filters and preview cards cleanly on mobile while preserving a usable comparison surface and full-width export actions.

## Verification
- Resolve existing compile blockers without changing their page behavior.
- Confirm route metadata, active navigation, controls, dialogs, toasts, desktop layout, and mobile layout in the live preview.
