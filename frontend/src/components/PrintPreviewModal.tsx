import { useState } from 'react'
import { X, Printer, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { PrintProntuario } from './print/PrintProntuario'
import { PrintReceita } from './print/PrintReceita'
import { PrintTermo } from './print/PrintTermo'
import { api } from '../lib/api'

type PrintPreviewModalProps = {
  document: any
  type: 'prescription' | 'consentTerm' | 'prontuario'
  onClose: () => void
  onSigned?: (signedDocument: any) => void
}

export function PrintPreviewModal({
  document,
  type,
  onClose,
  onSigned,
}: PrintPreviewModalProps) {
  const [currentDoc, setCurrentDoc] = useState(document)
  const [isSigning, setIsSigning] = useState(false)
  const [justSigned, setJustSigned] = useState(false)
  const [error, setError] = useState('')

  const isSigned = type === 'prontuario' || currentDoc?.status === 'SIGNED'

  async function handleSign() {
    setIsSigning(true)
    setError('')
    try {
      const endpoint =
        type === 'prescription'
          ? `/prescriptions/${currentDoc.id}/sign`
          : `/consent-terms/${currentDoc.id}/sign`
          
      const response = await api.post(endpoint)
      setCurrentDoc(response.data)
      setJustSigned(true)
      if (onSigned) {
        onSigned(response.data)
      }
    } catch (err) {
      setError('Falha ao assinar o documento. Por favor, verifique a conexão e tente novamente.')
    } finally {
      setIsSigning(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-slate-900/95 backdrop-blur-md animate-in fade-in-0 duration-300">
      {/* Barra de Ferramentas Superior Fixa (Não imprimível via CSS) */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-md print:hidden shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Visualização de Impressão</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {type === 'prontuario' ? 'Prontuário Consolidado' : type === 'prescription' ? 'Receita Médica' : 'Termo de Consentimento'}
            </p>
          </div>
        </div>

        {error && (
          <div className="hidden md:block text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg max-w-sm truncate">
            {error}
          </div>
        )}

        {justSigned && (
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Documento assinado com sucesso
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Botão de Assinar Documento */}
          {!isSigned && (
            <Button
              onClick={handleSign}
              disabled={isSigning}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs h-9 shadow-md shadow-emerald-900/20"
            >
              {isSigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {isSigning ? 'Assinando...' : 'Assinar Documento'}
            </Button>
          )}

          {/* Botão de Imprimir */}
          <Button
            onClick={handlePrint}
            disabled={!isSigned}
            className="bg-primary text-primary-foreground font-bold gap-1.5 text-xs h-9 shadow-md shadow-primary/10"
            title={!isSigned ? 'Assine o documento para liberar a impressão' : 'Imprimir'}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg transition-all"
            title="Fechar Visualização (Cancelar Emissão)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="md:hidden block mx-6 mt-4 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {justSigned && (
        <div className="md:hidden flex items-center gap-1.5 mx-6 mt-4 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg animate-in fade-in-0 duration-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Documento assinado com sucesso
        </div>
      )}

      {/* Visualizador do Layout do Documento */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/20 print:p-0 print:bg-white">
        <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-800/20 printable-container print:shadow-none print:border-none print:rounded-none">
          {type === 'prontuario' && <PrintProntuario pet={currentDoc} />}
          {type === 'prescription' && <PrintReceita prescription={currentDoc} />}
          {type === 'consentTerm' && <PrintTermo consentTerm={currentDoc} />}
        </div>
      </div>
    </div>
  )
}
