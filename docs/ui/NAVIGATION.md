# Navigation

> **Status: FROZEN — approved 2026-06-28.**
> The sidebar hierarchy, labels, icons, order, grouping, and navigation behavior below are taken
> verbatim from [`apps/admin/prototype/admin-dashboard.frozen.html`](../../apps/admin/prototype/admin-dashboard.frozen.html)
> (the `NAV` configuration and `render`/click wiring).
> **Do not rename items, reorder them, regroup them, change icons, or add/remove entries.**

---

## 1. Sidebar hierarchy

7 groups, 25 items. Order is top→bottom exactly as listed. `key` is the internal view id
(`data-v` attribute / `VIEWS` key) — labels are display text and must not be confused with keys.

### Overview
| Label | key | Icon |
|---|---|---|
| Dashboard | `dashboard` | `layout-dashboard` |

### Sell
| Label | key | Icon |
|---|---|---|
| Orders | `orders` | `shopping-cart` |
| Products | `products` | `package` |
| Inventory | `inventory` | `stack-2` |
| Customers | `customers` | `users` |

### Measure
| Label | key | Icon |
|---|---|---|
| Analytics | `analytics` | `chart-line` |
| Funnels | `funnels` | `filter` |
| UTM reports | `utm` | `link` |

### Grow
| Label | key | Icon |
|---|---|---|
| Marketing | `marketing` | `speakerphone` |
| Email | `email` | `mail` |
| WhatsApp | `whatsapp` | `brand-whatsapp` |
| Automations | `automations` | `route` |

### Convert
| Label | key | Icon |
|---|---|---|
| Discounts | `discounts` | `discount` |
| Coupons | `coupons` | `ticket` |
| Upsells | `upsells` | `trending-up` |
| Cross-sells | `crosssells` | `arrows-shuffle` |
| Reviews | `reviews` | `star` |

### Build
| Label | key | Icon |
|---|---|---|
| Landing pages | `landing` | `browser` |
| Page builder | `pagebuilder` | `layout-board` |
| A/B testing | `abtest` | `test-pipe` |
| Feature flags | `flags` | `flag` |

### System
| Label | key | Icon |
|---|---|---|
| Users | `users` | `user-cog` |
| Permissions | `permissions` | `shield-lock` |
| Activity logs | `activity` | `history` |
| Settings | `settings` | `settings` |

> Label→key gotchas (do not "fix" these): `Cross-sells`→`crosssells`, `Landing pages`→`landing`,
> `Page builder`→`pagebuilder`, `A/B testing`→`abtest`, `Feature flags`→`flags`,
> `UTM reports`→`utm`, `Activity logs`→`activity`.

---

## 2. Navigation rules

1. **Single source:** the sidebar is generated from the `NAV` array. Adding/removing/reordering items means editing `NAV` — which is a UI change and requires approval.
2. **Single active item:** exactly one item carries `.on` at a time. Clicking an item removes `.on` from all items and applies it to the clicked one.
3. **Default route:** on load, `Dashboard` is active and `render('dashboard')` runs.
4. **Render target:** clicking an item calls `render(key)`, which replaces only the `.main` region's content. The top bar and sidebar persist. There is no full page reload and no browser-history/URL routing in the frozen prototype.
5. **Per-view wiring after render:** `render` re-applies interactions for the view it draws —
   - `dashboard` → `enableDrag` on the KPI row,
   - `pagebuilder` → `wirePB`,
   - `flags` / `automations` / `settings` → `wireSwitches`.
6. **Active styling:** active item uses accent tokens (`--acb` bg, `--act` text); hover uses `--hov`. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
7. **Flat hierarchy:** navigation is one level deep. No nested/expandable menus, no sub-items, no secondary nav. Each item maps to exactly one screen in [ADMIN_UI_SPEC.md](ADMIN_UI_SPEC.md).
8. **Dark mode is not a nav item** — it is the top-bar `#dm` toggle, separate from navigation.

---

## 3. Collapsed (≤560px) behavior

At `max-width:560px` the sidebar stays in place but collapses to a **56px icon rail**: item
labels (`.ni span`) and group labels (`.ng`) are hidden, leaving centered icons. All navigation
rules above still apply. Full responsive behavior: [RESPONSIVE_RULES.md](RESPONSIVE_RULES.md).

---

## 4. Future navigation changes (require approval)

Anything that alters navigation is a UI change and must be approved first, including: renaming an
item, changing an icon, reordering, adding/removing items or groups, introducing nested menus,
adding URL-based routing or breadcrumbs, or adding a collapse/expand control. Functional wiring
that does **not** change the visible navigation (e.g. real URL sync behind identical labels) may
proceed, but must keep the rendered sidebar identical.
