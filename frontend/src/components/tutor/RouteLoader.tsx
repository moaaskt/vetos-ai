import { TutorLayout } from './TutorLayout';

export function RouteLoader() {
  return (
    <TutorLayout>
      <div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" 
        aria-busy="true" 
        aria-label="Carregando página"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 rounded-2xl bg-white border border-border/60 p-6 space-y-4 shadow-sm animate-pulse">
              <div className="h-20 w-20 rounded-full bg-muted/60 mx-auto" />
              <div className="h-6 w-32 rounded-lg bg-muted/60 mx-auto" />
              <div className="h-4 w-48 rounded bg-muted/60 mx-auto" />
              <div className="h-4 w-40 rounded bg-muted/60 mx-auto" />
            </div>
            <div className="h-48 rounded-2xl bg-white border border-border/60 p-6 space-y-4 shadow-sm animate-pulse">
              <div className="h-5 w-36 rounded bg-muted/60" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 rounded-xl bg-muted/60" />
                <div className="h-14 rounded-xl bg-muted/60" />
              </div>
            </div>
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-12 w-80 rounded-xl bg-white border border-border/60 p-3 shadow-sm animate-pulse flex items-center justify-between">
              <div className="h-6 w-20 rounded-full bg-muted/60" />
              <div className="h-6 w-20 rounded-full bg-muted/60" />
              <div className="h-6 w-20 rounded-full bg-muted/60" />
            </div>
            <div className="space-y-6">
              {[1, 2, 2].map((i, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-4 items-start bg-white/40 border border-border/40 rounded-2xl p-4 shadow-sm animate-pulse"
                >
                  <div className="h-10 w-10 rounded-full bg-muted/60 shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-32 rounded bg-muted/60" />
                    <div className="h-3 w-64 rounded bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}
