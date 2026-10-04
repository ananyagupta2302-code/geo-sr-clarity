<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the GeoSR demo as a frontend-only dashboard with mock data; its screen is composed in `src/components/geo-dashboard.tsx` and served at `/`, so no data service is required.
- Centralize dashboard visual roles and interaction styling in `src/styles.css`; reusable components consume those roles for consistent theming.
- Keep the scientific Validation workspace as a separate frontend-only module using existing GeoSR shell and mock imagery, so Dashboard and Super Resolution remain independent.
- Keep the Export workspace as a separate frontend-only module using the shared GeoSR shell and in-memory mock export history.
- Keep Settings as a separate frontend-only module using the shared GeoSR shell and browser-local saved preferences, so other workspaces remain independent.
- Keep Imagery Library as an independent frontend-only module using the shared GeoSR shell and local mock scenes, so existing workspaces remain unchanged.
