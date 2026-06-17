import type { Pet } from '../../lib/api'

type PrintProntuarioProps = {
  pet: Pet
}

export function PrintProntuario({ pet }: PrintProntuarioProps) {
  const dateStr = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="w-full max-w-[21cm] bg-white text-slate-900 p-12 flex flex-col justify-between select-none space-y-8">
      {/* Cabeçalho Oficial */}
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Prontuário Veterinário Consolidado</h2>
            <p className="text-xs text-slate-500 font-semibold">Emitido via sistema VetOS AI em {dateStr}</p>
          </div>
          <div className="text-right space-y-0.5 text-xs text-slate-500 font-semibold">
            <p className="font-bold text-slate-700">Clínica Veterinária VetOS</p>
            <p>Rua dos Veterinários, 123</p>
            <p>Telefone: (11) 99999-9999</p>
          </div>
        </div>

        {/* Ficha Cadastral do Pet e Tutor */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100 text-xs font-semibold">
          <div className="space-y-1.5">
            <h4 className="text-slate-500 uppercase tracking-wider text-[10px]">Identificação do Animal</h4>
            <p>Nome: <span className="text-sm font-bold text-slate-800">{pet.name}</span></p>
            <p>Espécie/Raça: <span className="text-slate-700">{pet.species} - {pet.breed || 'Não informada'}</span></p>
            <p>Idade: <span className="text-slate-700">{pet.age !== null && pet.age !== undefined ? `${pet.age} anos` : 'Desconhecida'}</span></p>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-slate-500 uppercase tracking-wider text-[10px]">Identificação do Proprietário/Tutor</h4>
            <p>Nome: <span className="text-sm font-bold text-slate-800">{pet.client?.name || 'Não informado'}</span></p>
            <p>Telefone: <span className="text-slate-700">{pet.client?.phone || 'Não informado'}</span></p>
            <p>E-mail: <span className="text-slate-700">{pet.client?.email || 'Não informado'}</span></p>
          </div>
        </div>

        {/* Alergias Registradas */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">⚠️ Alergias e Alertas</h3>
          {(!pet.allergies || pet.allergies.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhuma alergia relatada para este paciente.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {pet.allergies.map((a) => (
                <span key={a.id} className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-md text-xs font-bold">
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Evoluções e Notas Clínicas */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">📄 Evoluções e Procedimentos</h3>
          {(!pet.clinicalRecords || pet.clinicalRecords.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhum histórico clínico lançado.</p>
          ) : (
            <div className="space-y-4 pt-1">
              {pet.clinicalRecords.map((rec) => (
                <div key={rec.id} className="border border-slate-200 rounded-lg p-4 space-y-2 break-inside-avoid">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-800 uppercase">{rec.title || (rec.type === 'NOTE' ? 'Anotação de Evolução' : 'Procedimento')}</span>
                    <span className="text-slate-400">{new Date(rec.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{rec.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico Vacinal */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">💉 Vacinas e Doses</h3>
          {(!pet.vaccineRecords || pet.vaccineRecords.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhuma vacina registrada.</p>
          ) : (
            <table className="w-full border-collapse text-left text-[11px] font-semibold text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 text-[10px] font-bold">
                  <th className="p-2">Vacina</th>
                  <th className="p-2">Data de Aplicação</th>
                  <th className="p-2">Próxima Dose</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pet.vaccineRecords.map((vac) => (
                  <tr key={vac.id} className="border-b border-slate-100">
                    <td className="p-2 font-bold text-slate-800">{vac.name}</td>
                    <td className="p-2">{new Date(vac.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{vac.nextDoseDate ? new Date(vac.nextDoseDate).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="p-2 uppercase text-[10px] font-bold">{vac.status === 'APPLIED' ? 'Aplicada' : 'Agendada'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Medições de Peso */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">⚖ Histórico de Peso</h3>
          {(!pet.weightRecords || pet.weightRecords.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhum registro de peso.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto py-1">
              {pet.weightRecords.map((w) => (
                <div key={w.id} className="border border-slate-200 rounded p-2.5 text-center min-w-[90px] font-semibold bg-slate-50/50">
                  <p className="text-xs text-slate-400 uppercase tracking-wider text-[9px]">Data: {new Date(w.date).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{w.weight} kg</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receitas Emitidas (D-08 Consolidação) */}
        <div className="space-y-3 break-inside-avoid">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">💊 Receitas Médicas</h3>
          {(!pet.prescriptions || pet.prescriptions.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhuma receita registrada.</p>
          ) : (
            <div className="space-y-2.5">
              {pet.prescriptions.map((presc) => (
                <div key={presc.id} className="border border-slate-100 bg-slate-50/30 rounded p-3 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800">{presc.medicamento} ({presc.status === 'SIGNED' ? 'Assinada 🔒' : 'Rascunho'})</span>
                    <span className="text-slate-400 font-mono text-[9px]">Hash: {presc.documentHash?.substring(0, 16) || 'Não Assinado'}...</span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-0.5">Frequência: {presc.frequencia} | Duração: {presc.duracao} | Via: {presc.viaAdministracao}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Termos de Consentimento (D-08 Consolidação) */}
        <div className="space-y-3 break-inside-avoid">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">📄 Termos de Consentimento</h3>
          {(!pet.consentTerms || pet.consentTerms.length === 0) ? (
            <p className="text-xs text-slate-400 italic">Nenhum termo assinado.</p>
          ) : (
            <div className="space-y-2.5">
              {pet.consentTerms.map((term) => (
                <div key={term.id} className="border border-slate-100 bg-slate-50/30 rounded p-3 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800">Termo de Consentimento ({term.status === 'SIGNED' ? 'Assinado 🔒' : 'Rascunho'})</span>
                    <span className="text-slate-400 font-mono text-[9px]">Hash: {term.documentHash?.substring(0, 16) || 'Não Assinado'}...</span>
                  </div>
                  <p className="text-slate-500 text-[10px] truncate mt-0.5">{term.finalText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé Oficial com Assinatura Manual */}
      <div className="border-t border-slate-200 pt-8 mt-12 space-y-6 break-inside-avoid">
        <div className="flex justify-center">
          <div className="space-y-1 text-center min-w-[280px]">
            <div className="border-b border-slate-300 pb-1 w-full" />
            <p className="text-[11px] font-bold text-slate-600 uppercase">Assinatura do Médico Veterinário Responsável</p>
            <p className="text-[9px] text-slate-400 font-medium">CRMV / Registro Profissional</p>
          </div>
        </div>

        <div className="text-center text-[9px] text-slate-400 font-semibold">
          Documento gerado automaticamente pelo VetOS AI. Histórico médico confidencial de uso restrito da clínica.
        </div>
      </div>
    </div>
  )
}
