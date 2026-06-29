# Responsive rules

> **Status: FROZEN — approved 2026-06-28.**
> Derived verbatim from the single media query in
> [`apps/admin/prototype/admin-dashboard.frozen.html`](../../apps/admin/prototype/admin-dashboard.frozen.html).
> The prototype was designed **desktop-first**. There is exactly **one breakpoint**.
> Do not add, move, or remove breakpoints, and do not change collapse behavior, without approval.

---

## 1. The one rule that exists

```css
@media (max-width:560px){
  .body{grid-template-columns:56px 1fr}   /* sidebar → icon rail */
  .ni span,.ng{display:none}              /* hide nav labels + group headers */
  .ni{justify-content:center}            /* center the icons */
  .k4{grid-template-columns:repeat(2,1fr)}/* 4-up grids → 2-up */
}
```

Everything else is **fluid by default** (percentage/`fr` widths, `width:100%` tables and charts),
so the layout adapts continuously between sizes without additional breakpoints.

---

## 2. Desktop (> 560px) — the primary, designed target

- **Shell:** `.body` is a 2-column grid — **204px** sidebar + fluid (`1fr`) content.
- **Sidebar:** full width, showing group labels (`.ng`) and item labels (`.ni span`) beside icons.
- **KPI / 4-up grids (`.k4`):** 4 equal columns.
- **Dashboard / Analytics two-column rows:** `1.7fr 1fr` (chart wide, side card narrow). Automations and Settings: `1fr 1fr`. Landing pages: 3 equal columns.
- **Tables:** `width:100%`, cells `white-space:nowrap`; wide tables extend naturally within the fluid content column.
- This is the canonical experience — the approved screenshots/behavior all assume desktop.

---

## 3. Tablet — follows desktop rules

- **There is no dedicated tablet breakpoint in the frozen prototype.** Any viewport **wider than 560px** — including typical tablet landscape and most tablet portrait widths — renders with the **full desktop layout** (204px sidebar, 4-up KPIs, multi-column rows).
- Below 560px (small tablets in portrait, large phones), the mobile rule in §4 applies.
- **Do not invent a separate tablet tier.** If a dedicated tablet breakpoint is ever needed, it is a UI change and must be approved first.

---

## 4. Mobile (≤ 560px)

- **Sidebar collapses to a 56px icon rail:** group labels and item labels are hidden; only centered icons remain. Navigation still works exactly as on desktop (single active item, click-to-render). There is no hamburger/off-canvas drawer and no expand control in the frozen UI.
- **KPI / 4-up grids become 2-up** (`repeat(2,1fr)`).
- **All other grids** (`1.7fr 1fr`, `1fr 1fr`, 3-col landing) are **not** overridden, so they compress fluidly at narrow widths. Multi-column rows get tight on very small screens — this is the current, approved behavior; changing it requires approval.
- **Tables** keep `nowrap` cells; on narrow screens they overflow the content column horizontally (no stacking/card transform is defined).
- Page builder (`.pb`, `148px 1fr`), toolbars (`.tb`, `flex-wrap:wrap`), and top bar are not specially overridden; they reflow with their existing flex/grid rules.

---

## 5. Summary matrix

| Aspect | Desktop (>560px) | Tablet (>560px) | Mobile (≤560px) |
|---|---|---|---|
| Sidebar | 204px, labels shown | 204px, labels shown | 56px icon rail, labels hidden |
| Group labels (`.ng`) | shown | shown | hidden |
| KPI grid (`.k4`) | 4 columns | 4 columns | 2 columns |
| `1.7fr 1fr` / `1fr 1fr` / 3-col rows | as defined | as defined | fluidly compressed (not overridden) |
| Tables | full width, nowrap | full width, nowrap | nowrap, may overflow horizontally |
| Navigation behavior | single active, render-in-place | same | same |

---

## 6. Constraints for future work

- Keep **desktop-first**: the >560px layout is the source of truth.
- The **only** breakpoint is `max-width:560px`. Adding breakpoints (e.g. a tablet tier, a hamburger menu, table→card stacking on mobile) is a UI change requiring approval.
- Functional changes that do not alter any of the above responsive behavior may proceed; anything that changes how the layout reflows at any width must be approved first.
