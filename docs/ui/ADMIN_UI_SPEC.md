# Admin UI specification

> **Status: FROZEN — approved 2026-06-28.**
> This document describes the approved admin dashboard prototype exactly as built. The
> implementation reference is [`apps/admin/prototype/admin-dashboard.frozen.html`](../../apps/admin/prototype/admin-dashboard.frozen.html).
>
> **Do not redesign, re-layout, recolor, re-space, rename, or remove anything described here.**
> Implementation must reproduce this 1:1. Anything not listed here as implemented does **not**
> exist in the frozen UI and may not be added without explicit approval.

Related contracts: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) · [NAVIGATION.md](NAVIGATION.md) · [RESPONSIVE_RULES.md](RESPONSIVE_RULES.md)

---

## 1. Interaction legend

Each interaction below is tagged so implementation knows what is actually wired vs. what is a
visual placeholder in the frozen prototype.

| Tag | Meaning |
|---|---|
| **WIRED** | Functional in the prototype today. Behavior must be preserved exactly. |
| **STATIC** | Present visually but not wired. May be made functional later **without UI change**; the control, its label, icon, and position must not change. |

---

## 2. Global chrome (present on every screen)

The app is a single self-contained surface (`#ad-root`): a fixed top bar, a grouped left
sidebar, and a single main content region that swaps per navigation. There is **no** page
reload — navigation re-renders the `main` region only.

### 2.1 Top bar (`.tbar`)
| Element | Content | Behavior |
|---|---|---|
| Brand | Square logo "T" + text "Tiny Scholars" | STATIC |
| Search field (`.tsearch`) | `search` icon + placeholder "Search orders, products, customers" + `⌘K` hint, right-aligned | STATIC (visual; it is a styled `div`, not an input) |
| Dark mode toggle (`#dm`) | `moon` icon (light mode) / `sun` icon (dark mode) | **WIRED** — toggles `.dark` on `#ad-root` and swaps the icon |
| Notifications | `bell` icon button | STATIC |
| Help | `help` icon button | STATIC |
| Avatar (`.av`) | Initials "AE" circle | STATIC |

### 2.2 Sidebar (`.side`)
Grouped navigation — full hierarchy, icons, order, and rules are defined in
[NAVIGATION.md](NAVIGATION.md). Clicking an item is **WIRED**: it sets the single active item
and renders that view. Default active item on load: **Dashboard**.

### 2.3 Main region (`.main`)
Renders exactly one view at a time. Every view begins with a page header (`.ph`): an `h1`
title, a one-line subtitle (`.ph p`), and right-aligned action buttons.

---

## 3. Screens

There are **25 screens**, one per navigation item. Column lists below are the exact table
headers in the frozen UI; sample-row counts are fixed in the prototype (the data is seeded, not
fetched). "Actions" = the buttons in the page header, left→right.

### 3.1 Dashboard — key `dashboard`
- **Header:** title "Good morning, Abdo" · subtitle "Here is what is happening with your store today."
- **Actions:** `Last 30 days` (calendar, secondary, STATIC) · `Export` (download, secondary, STATIC) · `Add product` (primary, STATIC)
- **KPI row (`#kpis`, 4 cards):** Total revenue `$48,260` +12.4% ▲; Orders `1,284` +8.1% ▲; Conversion rate `3.42%` +0.6 pt ▲; Avg. order value `$37.60` −1.2% ▼. Each card shows a grip handle, a metric icon, the label, value, and a colored delta.
  - **WIRED — drag to reorder** (horizontal). KPI cards only; this is the only draggable KPI row in the app.
- **Revenue card** (`chart-area`): badge `+12.4%` (green); "`$48,260` vs $42,940 last period"; SVG area chart; month axis labels Jan · Mar · May · Jul · Sep · Nov. STATIC chart.
- **Conversion funnel card** (`filter`): 5 rows with progress bars — Sessions 52,400 / 100%, Product views 31,900 / 61%, Add to cart 9,420 / 18%, Checkout 4,710 / 9%, Purchases 2,830 / 5.4%.
- **Recent orders card-table** (`clock`): columns `Order · Customer · Total · Status`; 5 rows; header action `View all` (arrow-right, STATIC).
- **Top products card** (`flame`): ranked list of 4 products, each with a bar and a revenue figure.

### 3.2 Orders — key `orders`
- **Header:** "Orders" · "1,284 orders · 38 awaiting fulfillment"
- **Actions:** `Export` (STATIC) · `Create order` (primary, STATIC)
- **Status tabs (pills):** `All` (active) · `Unfulfilled` · `Unpaid` · `Open` · `Closed` — STATIC (no filtering wired; active pill is fixed to All).
- **Toolbar:** search (STATIC) · `Filter` (STATIC) · `Sort` (STATIC) · `Export` (STATIC).
- **Table:** columns `[checkbox] · Order · Date · Customer · Total · Payment · Fulfillment`; 7 rows (#1042–#1036). Row checkboxes are native `<input type="checkbox">` (toggle only; no bulk-action bar wired). Payment/Fulfillment use status badges.

### 3.3 Products — key `products`
- **Header:** "Products" · "312 products · 28 low stock" — **Actions:** `Import` (upload, STATIC) · `Add product` (primary, STATIC)
- **Toolbar:** standard (search/filter/sort/export, all STATIC)
- **Table:** `Product · Status · Inventory · Price · Type`; 5 rows. Status badge.

### 3.4 Inventory — key `inventory`
- **Header:** "Inventory" · "Across 3 warehouses" — **Actions:** `Adjust` (adjustments, STATIC) · `Transfer stock` (arrows-exchange, primary, STATIC)
- **Table:** `Product · SKU · Available · Committed · Stock`; 4 rows. The `Stock` cell is a progress bar + percentage.

### 3.5 Customers — key `customers`
- **Header:** "Customers" · "8,420 customers · 38% returning" — **Actions:** `Export` (STATIC) · `Add customer` (primary, STATIC)
- **Table:** `Customer · Location · Orders · Spent · Segment`; 5 rows. Segment badge (VIP/Repeat/New).

### 3.6 Analytics — key `analytics`
- **Header:** "Analytics" · "Store performance overview." — **Action:** `Last 30 days` (STATIC)
- **KPI row (4 cards):** Sessions 52,400 +6.2% ▲; Conversion 3.42% +0.6 pt ▲; Revenue $48,260 +12.4% ▲; Returning 38.1% +2.4 pt ▲.
  - **NOTE — these KPI cards are NOT draggable.** Only the Dashboard KPI row is draggable. Do not add drag here.
- **Sessions and revenue card** (`chart-area`): SVG area chart. STATIC.
- **Top channels card-table** (`world`): `Channel · Sessions · Conv. rate · Revenue`; 5 rows.

### 3.7 Funnels — key `funnels`
- **Header:** "Funnels" · "Checkout funnel · last 30 days" — **Action:** `Last 30 days` (STATIC)
- **Conversion funnel card** (`filter`): badge `5.4% overall`; same 5 funnel rows with bars as the Dashboard funnel.
- **Step drop-off card-table:** `Step · Visitors · Conversion · Drop-off`; 4 rows; drop-off badges (red/amber).

### 3.8 UTM reports — key `utm`
- **Header:** "UTM reports" · "First-party multi-touch attribution." — **Action:** `Export` (STATIC)
- **Toolbar:** standard. **Table:** `Campaign · Source / medium · Sessions · Conv. rate · Revenue`; 5 rows.

### 3.9 Marketing — key `marketing`
- **Header:** "Marketing" · "Campaigns across all channels." — **Action:** `Create campaign` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Campaign · Channel · Status · Audience · Revenue`; 4 rows. Status badge (Active/Paused/Draft).

### 3.10 Email — key `email`
- **Header:** "Email" · "SendGrid · 24,800 subscribers" — **Action:** `New campaign` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Campaign · Status · Recipients · Open · Clicks · Revenue`; 4 rows. Status badge (Sent/Automated/Scheduled).

### 3.11 WhatsApp — key `whatsapp`
- **Header:** "WhatsApp" · "Cloud API · 6,200 opted-in" — **Action:** `New broadcast` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Broadcast · Template · Delivered · Read · Replies · Status`; 4 rows.

### 3.12 Automations — key `automations`
- **Header:** "Automations" · "Lifecycle workflows triggered by events." — **Action:** `New automation` (primary, STATIC)
- **Body:** 2-column grid of 4 automation cards. Each card: title, a **WIRED toggle switch**, and a meta line (trigger badge · steps · runs (30d)). Cards: Abandoned cart recovery (on), Welcome series (on), Post-purchase review (on), Win-back lapsed (off).
  - **WIRED — switches toggle on click.**

### 3.13 Discounts — key `discounts`
- **Header:** "Discounts" · "Rules-based promotions engine." — **Action:** `Create discount` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Discount · Type · Value · Used · Status`; 4 rows.

### 3.14 Coupons — key `coupons`
- **Header:** "Coupons" · "Single-code redemptions." — **Action:** `Create coupon` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Code · Applies to · Used · Limit · Status`; 4 rows. Code shown in mono font.

### 3.15 Upsells — key `upsells`
- **Header:** "Upsells" · "Post-add and post-purchase offers." — **Action:** `Create upsell` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Offer · On product · Recommends · Take rate · Status`; 3 rows.

### 3.16 Cross-sells — key `crosssells`
- **Header:** "Cross-sells" · "Complementary recommendations." — **Action:** `Create rule` (primary, STATIC)
- **Toolbar:** standard. **Table:** `Rule · Shown on · Recommends · Attach rate · Status`; 3 rows.

### 3.17 Reviews — key `reviews`
- **Header:** "Reviews" · "4.7 average · 2,840 reviews" — **Action:** `Export` (STATIC)
- **Toolbar:** standard. **Table:** `Product · Rating · Review · Customer · Status`; 4 rows. Rating cell = amber `star` icon + numeric value. Status badge (Published/Pending/Flagged).

### 3.18 Landing pages — key `landing`
- **Header:** "Landing pages" · "6 pages · built with the page builder." — **Action:** `New landing page` (primary, STATIC)
- **Body:** 3-column card grid, 6 cards. Each card: a colored banner block (`.lp` with an icon), title + status badge, and a "X views · Y conv." meta line.

### 3.19 Page builder — key `pagebuilder`
- **Header:** "Page builder" · "Drag a block onto the canvas. Drag a block by its grip to reorder."
- **Actions:** device toggle group — Desktop / Tablet / Mobile icon buttons (STATIC) · `Preview` (eye, STATIC) · `Publish` (rocket, primary, STATIC)
- **Layout (`.pb`):** left palette (148px) + canvas.
  - **Palette ("Blocks"):** Hero, Product grid, Rich text, Image banner, Testimonial, Countdown, Newsletter, FAQ — each a draggable dashed chip.
  - **Canvas (`#cv`):** preloaded with 3 blocks — Hero, Product grid, Customer reviews. Each block: grip handle, icon, label, and `×` delete control.
- **WIRED interactions:**
  1. Drag a palette chip onto the canvas → appends a new block at the drop position.
  2. Click a palette chip → appends that block to the end of the canvas.
  3. Drag a canvas block by its grip → reorders within the canvas.
  4. Click a block's `×` → removes that block.
  5. Canvas shows a drop-target highlight (`.over`) while dragging over it.

### 3.20 A/B testing — key `abtest`
- **Header:** "A/B testing" · "3 running · 12 completed" — **Action:** `New experiment` (primary, STATIC)
- **Featured experiment card** (`test-pipe`, "Checkout: one-page vs multi-step", badge Running): two variant blocks with bars — Variant A · one-page (3.1% conversion); Variant B · multi-step (3.8% conversion, badge "+22% uplift"). Footer: "Significance 96% · 18,400 visitors · sequential test".
- **All experiments card-table:** `Experiment · Variants · Metric · Uplift · Status`; 3 rows.

### 3.21 Feature flags — key `flags`
- **Header:** "Feature flags" · "Ship behind flags. Toggle without a deploy." — **Action:** `New flag` (primary, STATIC)
- **Table:** `Flag · Key · Environment · Rollout · Status`; 4 rows. Key in mono; Environment as accent badge; Status as a **WIRED toggle switch**. Rows: New checkout flow (checkout.v2, Production, 25%, on), Wishlist gifting (wishlist.gifting, Production, 100%, on), AI size finder (pdp.ai_finder, Staging, 0%, off), Loyalty tiers (loyalty.tiers_v3, Production, 50%, on).
  - **WIRED — switches toggle on click.**

### 3.22 Users — key `users`
- **Header:** "Users" · "14 team members" — **Action:** `Invite user` (mail, primary, STATIC)
- **Toolbar:** standard. **Table:** `Name · Email · Role · Last active · Status`; 4 rows. Status badge (Active/Invited).

### 3.23 Permissions — key `permissions`
- **Header:** "Permissions" · "Role-based access control." — **Action:** `New role` (primary, STATIC)
- **Table (capability matrix):** `Role · Catalog · Orders · Marketing · Analytics · Settings`; 5 role rows (Owner, Admin, Merchandiser, Support, Analyst). Capability cells use a green `check` (granted) or muted `minus` (not granted) icon. STATIC (cells are not toggleable in the prototype).

### 3.24 Activity logs — key `activity`
- **Header:** "Activity logs" · "Immutable audit trail." — **Action:** `Export` (STATIC)
- **Body:** single card containing a timeline list of 5 entries. Each entry: actor initials avatar, "**actor** action target", right-aligned relative timestamp.

### 3.25 Settings — key `settings`
- **Header:** "Settings" · "Store configuration." — **Action:** `Save` (check, primary, STATIC)
- **Body:** 2-column grid of two cards.
  - **Store details** (`building-store`): rows Store name, Email, Currency, Timezone — each a label + static value.
  - **Checkout** (`credit-card`): rows Guest checkout (on), Express pay (on), Tax included (off), Abandoned email (on) — each a label + a **WIRED toggle switch**.
  - **WIRED — switches toggle on click.**

---

## 4. Global user flows (WIRED)

1. **Navigate:** click a sidebar item → all items lose `.on`, the clicked item gains `.on`, and `main` re-renders to that view via `render(key)`.
2. **Toggle dark mode:** click `#dm` → `#ad-root` toggles `.dark`; every token flips (see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)); the toggle icon swaps moon↔sun. State is per-session, not persisted.
3. **Reorder KPIs (Dashboard only):** drag a KPI card horizontally to a new position.
4. **Build a page (Page builder):** add blocks (drag or click), reorder by grip, delete by `×`.
5. **Toggle switches (Feature flags, Automations, Settings):** click a switch to flip its state.

---

## 5. Not implemented in the frozen UI (require approval to add)

The prototype intentionally does **not** contain the following. Adding any of them is a UI change
and must be approved first (see the freeze rules):

- **Modals / dialogs** — none. No primary/secondary button opens a modal.
- **Drawers / slide-overs** — none. There is no detail drawer for orders, products, customers, etc.
- **Real search, filtering, sorting, pagination** — the search fields, status tabs, Filter/Sort/Export buttons are visual placeholders (STATIC).
- **Form editing / submission** — Settings values and field rows are display-only; there are no editable text inputs except the visual checkboxes in Orders rows.
- **Detail / sub-pages** — every navigation item maps to exactly one top-level screen; there are no drill-down routes.
- **Toasts, empty states, loading states, error states** — none defined.
- **Persistence** — no state (dark mode, reordering, toggles, page builder edits) survives a reload.

When functionality requires any of the above, propose the **minimal** UI addition and get
approval before implementing.
