# Pronto! — Agent Instructions

## Project Overview

**Pronto!** is a Chrome extension that helps conference speakers auto-fill Call for Paper (CfP) submission forms by pulling their talk and bio data from talk management services (currently SymposiumApp). The user clicks the extension popup, selects a talk or bio, and the extension fuzzy-matches form fields and populates them automatically.

---

## Primary Mission

You are a **coding assistant agent** for this Chrome extension. Your primary concern is:

1. **Manifest V3 (MV3) migration** — the extension is currently on Manifest V2, which Chrome has deprecated and is no longer accepted for new submissions.
2. **General feature development, maintenance, and bug fixing** once the migration is complete.

---

## Tech Stack (Target State)

After modernisation, the extension should use:

| Concern | Current | Target |
|---------|---------|--------|
| Manifest | V2 | **V3** |
| Language | ES6 + Babel | **TypeScript** |
| Build | Gulp 3 + Browserify + Babelify | **Vite** (or esbuild) |
| Package management | Bower + npm | **npm only** (drop Bower entirely) |
| CSS | Bootstrap (Bower) + SCSS | **Plain CSS with CSS custom properties** |
| Analytics | Google Analytics (remote script) | **MV3-compliant analytics** (bundled, no remote scripts) |
| Testing | None | **Vitest** — unit + integration |
| Background | None (not in manifest) | **Service worker** (MV3 standard) |

---

## Architecture Principles

### 1. Pluggable Source Architecture
The extension must be designed so that additional talk/bio sources can be added without modifying core form-filling logic. Implement a **source interface/contract** that `SymposiumApiClient` conforms to, so that Sessionize, Papercall, or any other source can be added by implementing the same interface. Key interface methods:
- `getUserTalks()` → `Promise<Talk[]>`
- `getTalkInfo(id)` → `Promise<Talk>`
- `getBios()` → `Promise<Bio[]>`
- `getBio(id)` → `Promise<Bio>`

### 2. Service Worker Strategy
For anything that must live in the MV3 service worker (background), prefer the simplest idiomatic MV3 approach. When it is unclear whether logic should live in the service worker, popup, or content script, **flag the decision and propose an approach before implementing**. Do not guess on architecture.

### 3. TypeScript
All new and migrated code must be TypeScript. Use strict mode. Define explicit types/interfaces for:
- `Talk`, `Bio`, `User` data shapes (from API responses)
- The source adapter interface
- Chrome messaging message types (`FILL_TALK`, `FILL_BIO`)
- Config and settings schemas

---

## Known Bugs — Fix During Migration

These bugs were identified in the current codebase. Fix them as part of the migration work (they are small and related):

1. **`FormField.fillDropdown`** — crashes if `alternateOptions[property]` is undefined. Add a guard before accessing `alternateOptions[property][value]`.
2. **`SettingsReader.get()`** — uses `_.has()` which returns a boolean, but compares it to `-1`. This is always falsy and the fallback to `config[option]` never triggers correctly. Fix the condition.
3. **`BioLister` error handler** — the error callback body is entirely commented out. Restore proper error display.
4. **`TokenStorage.hasToken()`** — multiple `resolve()` calls inside the same Promise callback (no else branches), meaning `resolve(true)` always fires even if the earlier conditions resolved `false`. Fix the logic with proper `else if` / early returns.

---

## MV3 Migration Checklist

When performing the MV3 migration, ensure the following are addressed:

- [ ] Update `manifest.json` to `manifest_version: 3`
- [ ] Replace `browser_action` with `action`
- [ ] Replace `chrome.tabs.executeScript` / `chrome.tabs.insertCSS` with `chrome.scripting.executeScript` / `chrome.scripting.insertCSS` (requires `scripting` permission)
- [ ] Replace `options_ui.chrome_style: true` (removed in MV3)
- [ ] Add `host_permissions` (moved out of `permissions` in MV3)
- [ ] Add a service worker entry (`background.service_worker`) if background logic is needed
- [ ] Update `content_security_policy` format (MV3 uses an object, not a string)
- [ ] Audit and remove all remote script references (MV3 blocks them)
- [ ] Ensure analytics are bundled locally (no CDN/remote script tags)

---

## Build System

Replace Gulp 3 + Browserify + Bower with Vite (preferred) or esbuild. The build must:
- Bundle separate entry points: `popup`, `options`, `content` (content script)
- Support a `dev` mode (source maps, no minification) and a `production` mode
- Copy static assets (HTML, icons, fonts) into `extension/build/`
- Generate the final packaged ZIP for Chrome Web Store submission

Drop `bower.json` and all `bower_components` references. Migrate Bower deps (Bootstrap, jQuery, FontAwesome) to npm equivalents — or remove them if no longer needed (see CSS target state above).

---

## Testing

Use **Vitest** for all tests. Aim for:
- **Unit tests**: `FuzzyMapper`, `FormFiller`, `FormField`, `TokenStorage`, `SettingsReader`, and any new source adapters.
- **Integration tests**: Simulate the full flow from popup click to `chrome.tabs.sendMessage` to content script form fill. Mock Chrome APIs using a Chrome extension testing library (e.g., `jest-chrome` or `vitest` with manual mocks).

Tests live in a `tests/` directory at the project root, mirroring the `src/` structure.

---

## CSS & Styling

Drop Bootstrap and Bower. Use plain CSS with CSS custom properties (variables) for theming. The popup is small (400px wide max) — no framework needed. Keep styles scoped:
- `popup.css` — for the extension popup UI
- `options.css` — for the options page
- `injected.css` — for styles injected into CfP pages (highlight filled/skipped fields)

---

## Analytics

Google Analytics (remote CDN script) is blocked by MV3's Content Security Policy. Update analytics to be MV3-compliant:
- Bundle any tracking library locally (no remote script tags)
- Or use the Measurement Protocol via `fetch()` from the service worker
- Do not use the `ga('send', ...)` global — replace with an explicit, typed analytics module

---

## Working Style & Decision Protocol

When you encounter an **ambiguous design decision** (e.g., "should this logic live in the service worker vs. the popup?", "which OAuth flow is correct for MV3?"), do the following:

1. **Research first** — check MV3 docs, existing code, and constraints.
2. **Propose an approach** — write a short summary of the decision, your recommended approach, and the trade-offs.
3. **Ask before implementing** — do not proceed until the approach is confirmed.

This project favours **deliberate, reviewable changes** over fast autonomous decisions on architecture.

---

## File Structure Reference

```
pronto/
├── src/
│   ├── js/
│   │   ├── api/          # Source adapters (SymposiumApiClient, future sources)
│   │   ├── form/         # FormFiller, FuzzyMapper, FormField, alternate_names
│   │   ├── identity/     # TokenFetcher, TokenStorage
│   │   ├── options/      # AuthenticationManager, OptionStorage, ProntoOptions, SettingsReader
│   │   ├── popup/        # Popup, TalkLister, BioLister
│   │   ├── helper/       # Debug utility
│   │   ├── analytics.js  # GA module (to be replaced)
│   │   ├── pronto-content.js   # Content script entry point
│   │   ├── pronto-popup.js     # Popup entry point
│   │   └── pronto-options.js   # Options page entry point
│   ├── scss/             # SCSS source (to be replaced with plain CSS)
│   └── html/             # Popup and options HTML templates
├── extension/
│   ├── manifest.json     # Extension manifest (MV2 -> MV3)
│   └── resources/        # Icons
├── config/               # dev.js / production.js config files
├── tests/                # Vitest test suite (to be created)
└── gulpfile.js           # Build system (to be replaced with Vite config)
```

---

## Constraints & Non-Goals

- **Do not** use any remote CDN scripts or external resources loaded at runtime — MV3 CSP blocks them.
- **Do not** use jQuery in new code — it was a Bower dep; with native browser APIs and TypeScript, it is unnecessary.
- **Do not** make architectural changes without flagging them first (see Working Style above).
- Keep the extension focused: **CfP form auto-fill** is the core value. Do not scope-creep into a full talk management tool.

---

## GitHub Issue Labels & Agent Triage

When picking up or creating issues, use these standard labels:

| Category | Label | Purpose |
|----------|-------|---------|
| **Workflow** | `ready` | Well-specified and ready for immediate implementation by agent |
| | `needs-spec` | Needs API research, schema design, or user discussion first |
| | `blocked` | Blocked by external dependency or upstream issue |
| **Area** | `area:source` | Talk & bio data source adapters (Sessionize, Pretalx, etc.) |
| | `area:form-filling` | Form detection, fuzzy mapping, and field auto-fill |
| | `area:ui` | Extension popup and options page UI |
| | `area:build-infra` | Vite, TypeScript, packaging, and tooling |
| | `area:testing` | Unit and integration test coverage |
| **Priority** | `priority:high` | Next priority items |
| | `priority:medium` | Standard backlog |
| | `priority:low` | Nice-to-have |

