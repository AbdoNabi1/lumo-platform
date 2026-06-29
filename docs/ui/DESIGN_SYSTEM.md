# Design system

> **Status: FROZEN — approved 2026-06-28.**
> Every token below is extracted verbatim from [`apps/admin/prototype/admin-dashboard.frozen.html`](../../apps/admin/prototype/admin-dashboard.frozen.html).
> These are the only values allowed. Do not add, remove, rename, or alter any token, scale step,
> or value. New visual values require approval.

All theme values are CSS custom properties declared on `#ad-root` (light) and overridden on
`#ad-root.dark` (dark). Components reference only these variables — never raw hex.

---

## 1. Colors

### 1.1 Light mode (`#ad-root`)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f6f6f7` | Page background |
| `--surface` | `#ffffff` | Cards, sidebar, top bar |
| `--surface2` | `#fafafb` | Subtle surface (search field) |
| `--bd` | `#e8e8eb` | Default hairline border (1px) |
| `--bds` | `#d8d8dd` | Strong border (button outline, dashed) |
| `--hov` | `#f1f1f4` | Hover background; bar track; neutral badge bg |
| `--tx` | `#16161a` | Text primary |
| `--tx2` | `#5b5e66` | Text secondary |
| `--tx3` | `#8d909a` | Text muted (hints, group labels) |
| `--ac` | `#5b53e0` | Accent (primary action, active nav, chart line) |
| `--acb` | `#eeedfc` | Accent background (active nav, accent badge, banner) |
| `--act` | `#4a43c9` | Accent text / primary hover |
| `--gr` | `#0f8a4f` | Success text |
| `--grb` | `#e6f5ec` | Success background |
| `--am` | `#b5740a` | Warning text |
| `--amb` | `#fbf0db` | Warning background |
| `--rd` | `#c92f24` | Danger text |
| `--rdb` | `#fcebe9` | Danger background |

### 1.2 Dark mode (`#ad-root.dark`)

| Token | Value |
|---|---|
| `--bg` | `#0e0e11` |
| `--surface` | `#17171c` |
| `--surface2` | `#1d1d23` |
| `--bd` | `#2a2a31` |
| `--bds` | `#3a3a44` |
| `--hov` | `#222229` |
| `--tx` | `#f1f1f4` |
| `--tx2` | `#a6a9b1` |
| `--tx3` | `#71747d` |
| `--ac` | `#8b84f8` |
| `--acb` | `#272341` |
| `--act` | `#b8b3fb` |
| `--gr` | `#3fd089` |
| `--grb` | `#102619` |
| `--am` | `#e0a008` |
| `--amb` | `#2a2008` |
| `--rd` | `#f6776b` |
| `--rdb` | `#2a1512` |

Fixed (mode-independent): primary-button and switch-knob text/fills use literal `#fff`.

---

## 2. Typography

- **Font family:** `var(--font-sans)` for all UI. Monospace (`var(--font-mono)`) only for keys and coupon codes. (In the standalone file these resolve to a system sans / mono stack; in the chat host they were the host fonts.)
- **Base line-height:** `1.45` (set on `#ad-root`).
- **Weights:** only **400** (regular) and **500** (medium). No 600/700.
- **Casing:** sentence case everywhere.

| Use | Size | Weight |
|---|---|---|
| Page title (`.ph h1`) | 19px | 500 |
| Dashboard big number (revenue) | 24px | 500 |
| Metric value (`.metric .v`) | 22px | 500 |
| Card header (`.ch`) | 13.5px | 500 |
| Brand | 14px | 500 |
| Nav item (`.ni`) | 13px | 400 |
| Page subtitle (`.ph p`) | 13px | 400 |
| Body / table cells (`.tbl`) | 12.5px | 400 |
| Buttons (`.btn`) | 12.5px | 400 |
| Search text (`.tsearch`) | 12.5px | 400 |
| Pills, metric label, delta, funnel/meta text | 12px | 400/500 |
| Nav group label (`.ng`) | 11px | 500 |
| Badges (`.bdg`) | 11px | 500 |
| Keys / codes (mono), small hints (`⌘K`, timestamps, %) | 11px | 400 |

Smallest size used is **11px** — do not go below it.

---

## 3. Spacing

| Context | Value |
|---|---|
| Main content padding (`.main`) | `18px 20px 28px` |
| Top bar padding / gap (`.tbar`) | `10px 14px` / `12px` |
| Sidebar padding (`.side`) | `8px 0 16px` |
| Nav group label padding (`.ng`) | `12px 18px 4px` |
| Nav item padding / margin (`.ni`) | `6px 10px` / `1px 8px` |
| Page header bottom margin (`.ph`) | `16px` |
| Grid gap (`.grid`) | `12px` |
| Card body padding (`.cb`) | `14px` |
| Card header padding (`.ch`) | `11px 14px` |
| Table cell padding (th/td) | `9px 12px` |
| Toolbar gap / bottom margin (`.tb`) | `8px` / `12px` |
| Button padding (`.btn`) | `6px 12px` |
| Badge padding (`.bdg`) | `2px 9px` |
| Pill padding (`.pill`) | `5px 11px` |

Vertical rhythm between stacked blocks: `12px` (grid gap) and `margin-bottom:12px` on full-width sections. Internal element gaps: 6–16px.

---

## 4. Radius

| Element | Radius |
|---|---|
| App root (`#ad-root`) | `14px` |
| Cards, metric cards, canvas, blocks-as-cards | `12px` (block `.blk` = `10px`) |
| Buttons, icon buttons, inputs, search, nav items, palette chips, `.lp` banner | `8px` |
| Brand logo (`.lg`) | `7px` |
| Badges, pills, switches, progress bars | `999px` (full pill) |
| Avatar (`.av`) | `50%` (circle) |

---

## 5. Shadows

**None.** The system is deliberately flat — depth comes only from `1px` hairline borders
(`--bd` / `--bds`) and surface contrast. Do not introduce box-shadows, drop-shadows, blur, or
glow. (Native focus rings from the browser on `<input>` are the only exception.)

---

## 6. Icons

- **Set:** Tabler **outline** webfont, used as `<i class="ti ti-{name}"></i>`. Outline only — never `-filled` variants.
- Color and size inherit from the parent (`font-size`, `color`/`currentColor`).
- Decorative icons carry `aria-hidden="true"`; icon-only buttons carry `aria-label`.

| Context | Icon size |
|---|---|
| Top-bar icon buttons (`.ibtn`) | 18px |
| Nav item (`.ni i`) | 17px |
| Buttons (`.btn i`) | 16px |
| Block grip / delete (`.blk .gp`, `.blk .x`) | 16px |

**Icon inventory (do not substitute):** layout-dashboard, shopping-cart, package, stack-2,
users, chart-line, filter, link, speakerphone, mail, brand-whatsapp, route, discount, ticket,
trending-up, arrows-shuffle, star, browser, layout-board, test-pipe, flag, user-cog, shield-lock,
history, settings, search, moon, sun, bell, help, plus, calendar, download, upload, arrow-right,
arrow-up-right, arrow-down-right, currency-dollar, percentage, receipt, grip-vertical, chart-area,
clock, flame, arrows-sort, device-desktop, device-ipad, device-mobile, eye, rocket, photo,
layout-grid, align-left, photo-up, message-2, x, arrow-down, world, adjustments, arrows-exchange,
repeat, check, minus, building-store, credit-card, book, school, heart.

---

## 7. Buttons

| Variant | Class | Style |
|---|---|---|
| Secondary (default) | `.btn` | 12.5px; padding `6px 12px`; radius 8px; `1px solid var(--bds)`; bg `--surface`; text `--tx`; hover bg `--hov`; leading 16px icon, 6px gap |
| Primary | `.btn.pri` | as `.btn` but bg `--ac`, border `--ac`, text `#fff`; hover bg `--act` |
| Icon button | `.ibtn` | 32×32; transparent; text `--tx2`; hover bg `--hov` + text `--tx`; 18px icon |
| Toggle pill | `.pill` | 12px; padding `5px 11px`; radius 999px; `1px solid var(--bd)`; bg `--surface`; text `--tx2`. Active `.pill.on`: bg `--tx`, text `--bg`, border `--tx` |

**Rule:** at most one primary (`.btn.pri`) per page header. All other header buttons are `.btn`.

---

## 8. Forms

The frozen UI is display-forward; form controls are minimal:

- **Search fields** (`.tsearch`) are styled **`div`s**, not inputs: 32px tall, `1px solid var(--bd)`, radius 8px, bg `--surface2`, muted text, leading search icon. Top bar variant `flex:0 1 300px`; toolbar variant `flex:0 0 200px`.
- **Checkboxes** — native `<input type="checkbox">` in Orders rows (default browser style).
- **Switch** (`.sw`) — see §12.
- **Settings fields** are label + static value rows (`flex:0 0 150px` label column), not editable inputs.

Any new editable input must adopt: 32px height, radius 8px, `1px solid var(--bd)`, bg `--surface`/`--surface2`, 12.5px text — and must be approved before adding.

---

## 9. Tables

- Container: wrapped in a `.card` (radius 12px, `1px solid var(--bd)`, `overflow:hidden`).
- `.tbl`: `width:100%`, `border-collapse:collapse`, font 12.5px.
- `th`: left-aligned, weight 500, color `--tx2`, padding `9px 12px`, bottom border `--bd`, `white-space:nowrap`.
- `td`: padding `9px 12px`, bottom border `--bd`, `white-space:nowrap`.
- Last row: no bottom border. Row hover: bg `--hov`.
- **Card-table** variant adds a `.ch` header (icon + title + optional right action) above the table.

---

## 10. Cards

| Part | Style |
|---|---|
| `.card` | bg `--surface`; `1px solid var(--bd)`; radius 12px; `overflow:hidden` |
| `.ch` (header) | flex; padding `11px 14px`; bottom border `--bd`; 13.5px/500; leading icon; `.sp` spacer pushes a trailing action right |
| `.cb` (body) | padding `14px` |
| `.metric` (KPI card) | bg `--surface`; `1px solid var(--bd)`; radius 12px; padding `12px 14px`; `cursor:grab`; label (12px `--tx2`) / value (22px/500) / delta (12px, `.up`=green, `.dn`=red) |

---

## 11. Charts

- Inline **SVG**, `viewBox="0 0 600 150"`, `preserveAspectRatio="none"`, `width:100%`, `height:140`.
- Area = `polygon` filled `var(--acb)`; line = `polyline`, stroke `var(--ac)`, `stroke-width:2.5`, no fill.
- Month axis: a flex row of labels (Jan · Mar · May · Jul · Sep · Nov) at 11px `--tx3`.
- Same chart markup is reused on Dashboard (Revenue) and Analytics (Sessions and revenue).
- **Progress bar** (`.bar`): track 7px tall, radius 999px, bg `--hov`; fill `span` width = percent, bg `--ac`. Used in funnel rows, Top products, A/B variants, Inventory stock.

No external charting library is used in the frozen prototype.

---

## 12. Dark mode tokens

- Activated by adding `.dark` to `#ad-root` (toggled by the top-bar `#dm` button; icon swaps moon↔sun).
- The full dark palette is in §1.2 — every light token has a dark counterpart, so all components flip automatically with zero per-component overrides.
- The toggle is **WIRED**; state is per-session (not persisted) in the frozen prototype.
- Both modes are first-class: any new color must be added as a `--token` with both a light and a dark value (approval required).

---

## 13. Responsive rules

Full behavior is documented in [RESPONSIVE_RULES.md](RESPONSIVE_RULES.md). Summary: the frozen
prototype defines a **single breakpoint at `max-width: 560px`**. Above it, the layout is the
desktop layout (204px sidebar + fluid content, KPI rows 4-up). At/below 560px the sidebar
collapses to a 56px icon rail (labels and group headers hidden) and KPI rows become 2-up. There
is no separate tablet breakpoint.
