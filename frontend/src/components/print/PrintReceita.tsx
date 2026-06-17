import type { Prescription } from '../../lib/api'

type PrintReceitaProps = {
  prescription: Prescription
}

export function PrintReceita({ prescription }: PrintReceitaProps) {
  const isSigned = prescription.status === 'SIGNED'
  const dateStr = prescription.signedAt
    ? new Date(prescription.signedAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  return (
    <div className="w-full max-w-[21cm] bg-white text-slate-900 p-12 flex flex-col justify-between select-none">
      {/* Cabeçalho Oficial */}
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Receituário Veterinário</h2>
            <p className="text-xs text-slate-500 font-semibold">Emitido eletronicamente via VetOS AI</p>
          </div>
          <div className="text-right space-y-0.5 text-xs text-slate-500 font-semibold">
            <p className="font-bold text-slate-700">Clínica Veterinária VetOS</p>
            <p>Rua dos Veterinários, 123</p>
            <p>Telefone: (11) 99999-9999</p>
          </div>
        </div>

        {/* Informações do Paciente e Tutor */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs font-semibold">
          <div className="space-y-1">
            <p className="text-slate-500">PACIENTE (PET):</p>
            <p className="text-sm font-bold text-slate-800">{prescription.petId ? 'Paciente Cadastrado' : 'Paciente'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500">DATA DE EMISSÃO:</p>
            <p className="text-sm font-bold text-slate-800">{dateStr}</p>
          </div>
        </div>

        {/* Corpo da Receita / Prescrição */}
        <div className="py-8 space-y-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="p-3">Medicamento</th>
                  <th className="p-3">Dosagem</th>
                  <th className="p-3">Frequência</th>
                  <th className="p-3">Duração</th>
                  <th className="p-3">Via Adm.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 font-semibold text-slate-800">
                  <td className="p-3 text-sm font-bold">{prescription.medicamento}</td>
                  <td className="p-3">{prescription.dosagem}</td>
                  <td className="p-3">{prescription.frequencia}</td>
                  <td className="p-3">{prescription.duracao}</td>
                  <td className="p-3">{prescription.viaAdministracao}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {prescription.observacoes && (
            <div className="space-y-1.5 p-4 bg-slate-50/50 border border-slate-200/80 rounded-lg">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Observações Adicionais:</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{prescription.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé Oficial de Validação e Assinatura */}
      <div className="border-t border-slate-200 pt-8 mt-12 space-y-6 break-inside-avoid">
        <div className="flex justify-between items-end gap-8">
          {/* Assinatura Manual */}
          <div className="flex-1 space-y-1 text-center max-w-[280px]">
            <div className="border-b border-slate-300 pb-1 w-full" />
            <p className="text-[11px] font-bold text-slate-600 uppercase">Assinatura do Médico Veterinário</p>
            <p className="text-[9px] text-slate-400 font-medium">CRMV Ativo</p>
          </div>

          {/* Assinatura e QR Code de Validação Jurídica */}
          {isSigned && (
            <div className="flex items-center gap-4 border border-slate-100 bg-slate-50/80 p-3 rounded-lg max-w-[380px] overflow-hidden">
              {prescription.verificationQrCode && (
                <img
                  src={prescription.verificationQrCode}
                  alt="QR Code de Validação"
                  className="h-16 w-16 bg-white p-1 border border-slate-200 rounded shrink-0"
                />
              )}
              <div className="space-y-1 text-left min-w-0">
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  ✓ DOCUMENTO ASSINADO DIGITALMENTE
                </p>
                {prescription.documentHash && (
                  <p className="text-[8px] font-mono text-slate-400 select-all leading-tight break-all font-semibold" title={prescription.documentHash}>
                    Hash: {prescription.documentHash}
                  </p>
                )}
                {prescription.verificationUrl && (
                  <p className="text-[9px] text-slate-500 font-medium leading-tight break-all" style={{ overflowWrap: 'anywhere' }}>
                    Valide em:{' '}
                    <span className="font-bold text-slate-700 select-all">
                      {window.location.origin}{prescription.verificationUrl}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé institucional de rodagem de página */}
        <div className="text-center text-[9px] text-slate-400 font-semibold">
          Este documento clínico faz parte do prontuário veterinário e foi emitido eletronicamente.
        </div>
      </div>
    </div>
  )
}
