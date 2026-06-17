# Quick Task 001: Redesign VetOS AI Frontend Visual Experience - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Task Boundary

Redesign the VetOS AI frontend visual experience without changing business logic. Make the tenant admin and super admin dashboards look like a premium modern SaaS product (Stripe/Linear/Vercel inspired). Preserve all existing API calls, auth logic, routes, and data flows.
</domain>

<decisions>
## Implementation Decisions

### Navigation Layout
- Use a hybrid layout: Desktop collapsible sidebar with premium compact mode, Tablet/Mobile drawer navigation.
- Add a contextual topbar with breadcrumbs, quick actions, notifications, and clinic context.
- Tenant dashboard: operational and focused. Super Admin: analytical and platform-oriented.

### Theme & Color Palette
- Prioritize a world-class dark mode first (no light mode).
- Use deep slate backgrounds (`slate-950`), layered cards (`bg-slate-900/50` to `bg-slate-900/90`), soft borders (`border-white/10` or `border-border`), teal accents (`teal-400`), subtle gradients, premium shadows, and semantic colors for status/alerts.
- Inspired by Stripe, Linear, Attio, Vercel, Notion.

### Data Density & Typography Scale
- Tenant dashboard: more spacious, welcoming, humanized, and operational.
- Super Admin dashboard: denser, analytical, platform-level, and optimized for fast metric/table scanning.
- Typography: large bold titles, soft secondary text (`slate-400`), strong hierarchy, excellent spacing rhythm.
</decisions>

<specifics>
## Specific Ideas

- Richer dashboard sections: today overview, quick actions, recent activity placeholder, upcoming appointments card.
- Improve cards with better gradients, borders, icons, labels, and descriptions.
- Premium tables with better header styling, spacing, and hover row states.
- Polished modals, centered with clear headings and actions.
</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.
</canonical_refs>
