interface EmptyTimelineStateProps {
  petName: string;
}

export function EmptyTimelineState({ petName }: EmptyTimelineStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/60 rounded-2xl border border-dashed border-border/60 transition-all duration-500 animate-in fade-in-0">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/8 text-3xl"
        aria-hidden="true"
      >
        🐾
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        Nenhum evento nesta categoria
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        Não há registros correspondentes ao filtro selecionado para <span className="font-medium text-foreground">{petName}</span>.
      </p>
    </div>
  );
}
