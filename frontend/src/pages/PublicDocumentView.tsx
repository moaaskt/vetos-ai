import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { PrintReceita } from '../components/print/PrintReceita'
import { PrintTermo } from '../components/print/PrintTermo'
import type { Prescription, ConsentTerm } from '../lib/api'

type DocumentPayload = {
  documentType: 'RECEITA_MEDICA' | 'TERMO_DE_CONSENTIMENTO'
  document: any
}

export function PublicDocumentView() {
  const { hash } = useParams<{ hash: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DocumentPayload | null>(null)

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true)
        setError(null)
        // Chamada ao novo endpoint público do backend
        const response = await api.get(`/verify/${hash}/details`)
        setData(response.data)
      } catch (err: any) {
        console.error('Erro ao carregar documento:', err)
        setError(
          err.response?.data?.message ||
            'Não foi possível encontrar ou validar o documento solicitado.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (hash) {
      loadDocument()
    }
  }, [hash])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 animate-pulse">
            Verificando e carregando assinatura digital...
          </p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ⚠
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-800">Documento Inválido</h1>
            <p className="text-sm text-slate-500 font-medium">
              {error || 'O link acessado é inválido ou o documento não está mais ativo.'}
            </p>
          </div>
          <div className="text-xs text-slate-400 font-semibold border-t border-slate-100 pt-4">
            Em caso de dúvidas, entre em contato com a clínica emitente.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-4 md:p-8 select-none">
      {/* Barra de Ações Standalone - Ocultada na Impressão */}
      <div className="w-full max-w-[21cm] bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-lg font-bold">
            ✓
          </div>
          <div className="text-left">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              ✓ Documento Autenticado
            </p>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">
              {data.documentType === 'RECEITA_MEDICA' ? 'Receita Médica Veterinária' : 'Termo de Consentimento Livre'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Documento válido e registrado digitalmente
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
        >
          🖨 Imprimir Documento
        </button>
      </div>

      {/* Conteúdo do Documento Reutilizando as Telas de Impressão */}
      <div className="w-full max-w-[21cm] bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 flex justify-center">
        {data.documentType === 'RECEITA_MEDICA' ? (
          <PrintReceita prescription={data.document as Prescription} />
        ) : (
          <PrintTermo consentTerm={data.document as ConsentTerm} />
        )}
      </div>

      {/* CSS Vanilla Embutido para Ocultar Barra de Ações e Forçar Layout na Impressão */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          div.min-h-screen {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            box-shadow: none !important;
          }
          div.max-w-\\[21cm\\] {
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
