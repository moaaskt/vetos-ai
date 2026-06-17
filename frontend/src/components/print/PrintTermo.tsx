import type { ConsentTerm } from '../../lib/api'

type PrintTermoProps = {
  consentTerm: ConsentTerm
}

export function PrintTermo({ consentTerm }: PrintTermoProps) {
  const isSigned = consentTerm.status === 'SIGNED'
  const dateStr = consentTerm.signedAt
    ? new Date(consentTerm.signedAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  return (
    <div className="w-full max-w-[21cm] min-h-[29.7cm] bg-white text-slate-900 p-12 flex flex-col justify-between select-none">
      {/* Cabeçalho Oficial */}
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Termo de Consentimento Livre e Esclarecido</h2>
            <p className="text-xs text-slate-500 font-semibold">Emitido eletronicamente via VetOS AI</p>
          </div>
          <div className="text-right space-y-0.5 text-xs text-slate-500 font-semibold">
            <p className="font-bold text-slate-700">Clínica Veterinária VetOS</p>
            <p>Rua dos Veterinários, 123</p>
            <p>Telefone: (11) 99999-9999</p>
          </div>
        </div>

        {/* Informações de Emissão */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs font-semibold">
          <div className="space-y-1">
            <p className="text-slate-500">PACIENTE (PET):</p>
            <p className="text-sm font-bold text-slate-800">Paciente Cadastrado</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500">DATA DE ASSINATURA:</p>
            <p className="text-sm font-bold text-slate-800">{dateStr}</p>
          </div>
        </div>

        {/* Texto do Termo */}
        <div className="py-6 space-y-4">
          <div className="p-6 border border-slate-200 rounded-lg bg-slate-50/20 text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
            {consentTerm.finalText}
          </div>
        </div>
      </div>

      {/* Rodapé Oficial de Validação e Assinatura */}
      <div className="border-t border-slate-200 pt-8 mt-12 space-y-6 break-inside-avoid">
        <div className="flex justify-between items-end gap-8">
          {/* Assinatura Manual do Tutor */}
          <div className="flex-1 space-y-1 text-center max-w-[280px]">
            <div className="border-b border-slate-300 pb-1 w-full" />
            <p className="text-[11px] font-bold text-slate-600 uppercase">Assinatura do Proprietário/Tutor</p>
            <p className="text-[9px] text-slate-400 font-medium">Declaração de Consentimento</p>
          </div>

          {/* Assinatura e QR Code de Validação Jurídica */}
          {isSigned && (
            <div className="flex items-center gap-4 border border-slate-100 bg-slate-50/80 p-3 rounded-lg max-w-[380px]">
              {consentTerm.verificationQrCode && (
                <img
                  src={consentTerm.verificationQrCode}
                  alt="QR Code de Validação"
                  className="h-16 w-16 bg-white p-1 border border-slate-200 rounded shrink-0"
                />
              )}
              <div className="space-y-1 text-left">
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  ✓ DOCUMENTO ASSINADO DIGITALMENTE
                </p>
                {consentTerm.documentHash && (
                  <p className="text-[8px] font-mono text-slate-400 select-all leading-tight break-all font-semibold" title={consentTerm.documentHash}>
                    Hash: {consentTerm.documentHash}
                  </p>
                )}
                {consentTerm.verificationUrl && (
                  <p className="text-[9px] text-slate-500 font-medium leading-tight">
                    Valide em:{' '}
                    <span className="font-bold text-slate-700 select-all">
                      {window.location.origin}{consentTerm.verificationUrl}
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
