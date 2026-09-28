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

- OEKO is a frontend-only client preview: route pages share a single interactive demo workspace and local in-memory data, because the request excludes backend implementation.

- Keep OEKO demo records in the root-level React provider so route-based forms and CRM details retain changes during navigation without a backend.
- Keep the desktop navigation visibility in the root demo provider so the chosen layout survives page navigation without browser storage.
- Keep the commercial dashboard in its own presentation component and reuse the department-map component unchanged, so sales refinements do not alter its geographic visualization.

- Toutes les données de démonstration (dossiers, rendez-vous, devis, documents, journal) vivent dans OekoDemoProvider : chaque écran lit et écrit ce même état pour rester cohérent sans backend.
