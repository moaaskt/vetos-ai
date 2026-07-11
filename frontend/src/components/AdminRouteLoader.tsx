/**
 * Generic route-level loading fallback for admin/public pages.
 * Renders a minimal, full-height skeleton to avoid layout shift
 * while a lazy-loaded chunk downloads.
 */
export function AdminRouteLoader() {
  return (
    <div
      className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      aria-busy="true"
      aria-label="Carregando página"
    >
      <div className="space-y-6 animate-pulse">
        {/* Page header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 rounded-lg bg-muted/60" />
          <div className="h-9 w-28 rounded-lg bg-muted/60" />
        </div>
        {/* Content card skeleton */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-4">
          <div className="h-5 w-64 rounded bg-muted/60" />
          <div className="h-4 w-full rounded bg-muted/40" />
          <div className="h-4 w-5/6 rounded bg-muted/40" />
          <div className="h-4 w-3/4 rounded bg-muted/40" />
        </div>
        {/* Table/list skeleton */}
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-3">
          {[1, 2, 3, 4].map((_, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted/60" />
                <div className="h-3 w-64 rounded bg-muted/40" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
