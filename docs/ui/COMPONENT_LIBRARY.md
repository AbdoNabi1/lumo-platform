# Component library

> **Status: FROZEN — approved 2026-06-28.**
> This catalogs every reusable component in [`apps/admin/prototype/admin-dashboard.frozen.html`](../../apps/admin/prototype/admin-dashboard.frozen.html),
> at two levels: the **CSS components** (the visual primitives) and the **JS builders** (the
> functions that compose them). When re-implementing in a real stack (e.g. React + shadcn/ui),
> each item below must map 1:1 to a component that renders identically. Do not change signatures,
> markup shape, classes, or output.

---

## 1. CSS components (visual primitives)

| Component | Selector | Responsibility |
|---|---|---|
| App root | `#ad-root` / `.dark` | Theme token scope + frame (border, radius 14px, column flex). Holds light/dark palettes. |
| Top bar | `.tbar` | App header row. |
| Brand | `.brand`, `.lg` | Logo mark + product name. |
| Search field | `.tsearch` | Faux search control (top bar + toolbar variants). |
| Top-bar actions | `.tacts`, `.ibtn`, `.av` | Icon buttons + avatar. |
| Sidebar | `.side` | Navigation container. |
| Nav group label | `.ng` | Group heading (hidden ≤560px). |
| Nav item | `.ni`, `.ni.on` | Navigation link; `.on` = active. |
| Main region | `.main` | View container. |
| Page header | `.ph`, `.ph h1`, `.ph p` | Title + subtitle + actions row. |
| Spacer | `.sp` | `flex:1` push element (right-aligns actions). |
| Button | `.btn`, `.btn.pri` | Secondary / primary action. |
| Icon button | `.ibtn` | 32×32 icon-only button. |
| Pill | `.pill`, `.pill.on` | Tab/filter pill; `.on` = active. |
| Grid | `.grid`, `.k4` | 12px-gap grid; `.k4` = 4 equal columns. |
| Metric card | `.metric`, `.l`, `.v`, `.dl`, `.dl.up`, `.dl.dn` | KPI card (label/value/delta). `cursor:grab`. |
| Card | `.card`, `.ch`, `.cb` | Surface container + header + body. |
| Table | `.tbl` (`th`,`td`) | Data table inside a card. |
| Badge | `.bdg` + `.bg`/`.ba`/`.br`/`.bn`/`.bc` | Status pill: green / amber / red / neutral / accent. |
| Toolbar | `.tb` | Search + filter/sort/export row. |
| Switch | `.sw`, `.sw.on` | Boolean toggle. |
| Progress bar | `.bar` (`> span`) | Percent fill bar. |
| Page builder | `.pb`, `.pal`, `.pi`, `.cv`, `.cv.over`, `.blk`, `.blk.drag`, `.gp`, `.x` | Palette / canvas / draggable block. |
| Landing banner | `.lp` | Colored card banner with centered icon. |

---

## 2. JS builders (composition functions)

These pure functions return HTML strings and are the single source for how each pattern is
assembled. A real implementation should expose an equivalent component with the same inputs.

| Builder | Signature | Returns |
|---|---|---|
| `ic` | `ic(name)` | `<i class="ti ti-{name}" aria-hidden="true">` — icon. |
| `bd` | `bd(text, cls)` | `.bdg` badge with variant class (`bg`/`ba`/`br`/`bn`/`bc`). |
| `head` | `head(title, subtitle, actionsHTML)` | `.ph` page header (title + subtitle + right-aligned actions). |
| `pri` | `pri(label, icon='plus')` | `.btn.pri` primary button. |
| `sec` | `sec(label, icon)` | `.btn` secondary button. |
| `tbl` | `tbl(cols[], rows[][])` | `.tbl` table (cells are raw HTML). |
| `ctbl` | `ctbl(title, icon, cols, rows, actionHTML?)` | Card-wrapped table with a `.ch` header. |
| `bar` | `bar(percent)` | `.bar` progress bar. |
| `toolbar` | `toolbar()` | `.tb` toolbar: search + Filter + Sort + Export. |
| `list` | `list(title, subtitle, actionsHTML, cols, rows)` | Standard list page = `head` + `toolbar` + card table. **Used by 13 screens** (products, customers, marketing, email, whatsapp, discounts, coupons, upsells, crosssells, reviews, users, utm, inventory). |
| `metric` | `metric([label, value, delta, dir, icon])` | `.metric` KPI card; `dir` = `up`/`dn`. |
| `fnrow` | `fnrow([label, value, percent])` | Funnel row = label/value line + `bar`. |
| `CHART` | constant | Inline SVG area chart + month axis (reused by Dashboard + Analytics). |

---

## 3. Behavior helpers (wiring)

| Helper | Signature | Responsibility |
|---|---|---|
| `after` | `after(container, selector, coord, axis)` | Returns the element a dragged item should be inserted before, given pointer `coord` on `axis` (`'x'`/`'y'`). Drag-reorder math. |
| `enableDrag` | `enableDrag(container, selector, axis)` | Makes children draggable and reorders them on `dragover`. Used for the Dashboard KPI row (`#kpis`, axis `x`). |
| `wirePB` | `wirePB()` | Wires the Page builder: palette drag-to-add, palette click-to-add, canvas reorder, block delete, drop-target highlight. |
| `wireSwitches` | `wireSwitches()` | Click-to-toggle for every `.sw` in the current view. Used by Feature flags, Automations, Settings. |
| `render` | `render(key)` | View dispatcher: sets `main.innerHTML = VIEWS[key]()`, then applies the view's wiring (`enableDrag` for dashboard, `wirePB` for pagebuilder, `wireSwitches` for flags/automations/settings). Falls back to `dashboard`. |

---

## 4. Configuration / data structures

| Name | Shape | Responsibility |
|---|---|---|
| `NAV` | `[ [groupLabel, [ [key, label, icon], … ] ], … ]` | Sidebar hierarchy (see [NAVIGATION.md](NAVIGATION.md)). Source of truth for nav rendering. |
| `VIEWS` | `{ [key]: () => htmlString }` | View registry; one entry per screen key. |
| `KPI`, `FN`, `PRD` | arrays | Seeded sample data for Dashboard KPIs, funnel, top products. |

---

## 5. shadcn/ui mapping (for real implementation — render must stay identical)

| Frozen component | shadcn/ui equivalent |
|---|---|
| `.side` + `NAV` + `.ni` | `Sidebar`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem` |
| `.card` / `.ch` / `.cb` | `Card`, `CardHeader`, `CardContent` |
| `tbl` / `ctbl` / `list` | `Table` + TanStack Table (`DataTable`) |
| `bd` (`.bdg`) | `Badge` (variant per color) |
| `.btn` / `.btn.pri` / `.ibtn` | `Button` (`variant="outline"` / default / `size="icon"`) |
| `.pill` tabs | `Tabs` or `ToggleGroup` |
| `.sw` | `Switch` |
| `.metric` | `Card` composition |
| `CHART` / `.bar` | `Recharts` in `ChartContainer` / a `Progress`-style bar |
| Page builder (`.pb`) | `dnd-kit` (`@dnd-kit/sortable`) |
| Dark mode (`.dark`) | `next-themes` `ThemeProvider` |
| `.tsearch` | `Input` with a leading icon (kept visual until search is approved as functional) |

> Mapping is a **rendering contract**, not a license to restyle. The shadcn components must be
> themed to the tokens in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) so output is pixel-equivalent to
> the frozen prototype.
