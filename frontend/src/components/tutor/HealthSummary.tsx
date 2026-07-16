import { SummaryCard } from './timeline/SummaryCard';

interface HealthSummaryProps {
  vaccinesSummary: string;
  weightSummary: string;
  allergiesSummary: string;
  treatmentsSummary: string;
  nextAppointmentSummary: string;
}

export function HealthSummary({
  vaccinesSummary,
  weightSummary,
  allergiesSummary,
  treatmentsSummary,
  nextAppointmentSummary,
}: HealthSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-4 transition-all duration-300">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <span className="text-primary">✨</span> Resumo de Saúde
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard icon="🛡️" label="Vacinas" value={vaccinesSummary} />
        <SummaryCard icon="⚖️" label="Peso" value={weightSummary} />
        <SummaryCard icon="⚠️" label="Alergias" value={allergiesSummary} />
        <SummaryCard icon="💊" label="Tratamentos" value={treatmentsSummary} />
        <SummaryCard icon="📅" label="Próxima Consulta" value={nextAppointmentSummary} wide />
      </div>
    </div>
  );
}
