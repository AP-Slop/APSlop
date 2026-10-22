# New app: AI draws the screens, the user fixes them, then the code is written (増分 2)

Date: 2026-10-23. Follows `2026-10-22-ai-quality-ideas.md` (idea 4, replaced by the wireframe integration) and
`2026-10-22-build-fix-loop.md` (増分 1). Screens: `docs/superpowers/wireframes/a/new-input.json`,
`new-design.json`, `new-design-edit.json` (Design A, chosen by the user on 2026-10-23 over "edit in place").

## What the user does

1. New app: describe the app, pick the AI, press **Draw screens**. The page `/new/design/<id>` opens and
   says AI is drawing (about a minute; the page refreshes itself).
2. The page shows **What the app does** (a text box the user can edit) and the screens as small
   pictures (2–5 phone screens), with **Looks good, generate code**, **Edit screens**, **Draw again**,
   **Start over**.
3. **Edit screens** opens the wireframe editor full page (`/wireframe/?design=<id>&screen=<id>`), the
   same editor as `~/workspace/dev/utils/wireframe`, with a bar above it: **← Back to screens** and
   **Done editing** (both return to the page; the editor warns when something is unsaved). The user
   edits as usual: move parts, add parts from Elements, add a screen from Templates, change the theme,
   Save (Ctrl+S).
4. **Looks good, generate code** writes the code from the prompt, the plan text and the screens; then
   the existing review (name, repository name, files) and **Create repository**. The screens are
   committed to the new repository under `docs/wireframes/` with the code.

The screen step cannot be skipped; confirming AI's drawing unchanged is one press.

## Decisions

- **The editor is embedded as built, not rewritten.** The wireframe tool gained two host hooks
  (`WIREFRAME_API_BASE`, `WIREFRAME_NO_WS`, commit d529e5d there) and two extra bundles
  (`embed-core.js` for the server, `embed-thumb.js` for the thumbnails). `web/scripts/sync-wireframe.mjs`
  copies them into `web/public/wireframe/` and `web/src/vendor/wireframe/core.js`; the copies are
  committed so the site builds without Deno.
- **The editor page is a static file** (`public/wireframe/index.html`), outside the Next.js layout: the
  editor owns the whole viewport and its CSS is global. The design id comes from `?design=`.
- **One flat project per design, in one D1 row** (`Design.project`, `Design.screens` as JSON text).
  Hashes are SHA-256 of the serialized text, as in the tool, so the editor's conflict handling works
  unchanged. The server mirrors the tool's `/api/project`, `/api/screens`, `/api/templates` (built-ins);
  MySets, Defaults, saved motions, reference images (AI tab), proposals and the guide answer empty or
  405 — the editor shows the message and goes on.
- **AI writes a subset of the screen format** (`src/lib/design-ai.ts`: 20 element types, children one
  level deep inside `rect`, a few props), checked with the tool's own `validateScreen`; a reused id is
  renamed, a rejected part is dropped, and one second round with the checker's complaints is asked for
  when something had to be dropped. The kept screens are filled and settled exactly as the tool writes them.
- **The code prompt** gets the original request, the plan text (as edited) and, per screen, a one-line
  outline per part plus the screen JSON (`designForPrompt`). The AI used for the code is the one chosen
  for the drawing.
- **Background work** goes through the existing job queue (`draw` job) so the browser can be closed.
- Device is `phone` (390×844) for every design; theme defaults to `clean` and can be changed in the editor.

## Not in this increment

- Create PR with AI does not yet open the repo's screens (next increment).
- The plan text and the screens are edited separately; changing the text does not redraw the screens
  (Draw again redraws everything from the prompt).
- The editor's AI tab (drop a screenshot) says it cannot be used here.
- Designs are not listed anywhere (Dashboard shows the generation once code is made).
