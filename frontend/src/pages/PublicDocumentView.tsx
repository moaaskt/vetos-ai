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

  const [tutorName, setTutorName] = useState('')
  const [tutorCpf, setTutorCpf] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formatCpf = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 11)
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const isValidCpf = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false

    let sum = 0
    let remainder

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.substring(9, 10), 10)) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (12 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.substring(10, 11), 10)) return false

    return true
  }

  const handleTutorSign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setSubmitError('Você deve concordar com os termos para continuar.')
      return
    }
    if (!tutorName.trim() || !tutorCpf.trim()) {
      setSubmitError('Por favor, preencha todos os campos.')
      return
    }

    if (!isValidCpf(tutorCpf)) {
      setSubmitError('Por favor, informe um CPF válido.')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)
      const response = await api.post(`/verify/${hash}/tutor-sign`, {
        name: tutorName,
        cpf: tutorCpf,
      })
      setData((prev) => prev ? { ...prev, document: response.data } : null)
    } catch (err: any) {
      console.error('Erro ao assinar termo:', err)
      setSubmitError(
        err.response?.data?.message || 'Ocorreu um erro ao registrar sua assinatura.'
      )
    } finally {
      setSubmitting(false)
    }
  }

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

      {data.documentType === 'TERMO_DE_CONSENTIMENTO' && (
        <div className="w-full max-w-[21cm] mt-6 print:hidden">
          {!data.document.tutorSigned ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-2">Assinatura Eletrônica do Tutor</h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Por favor, preencha os dados abaixo para confirmar seu consentimento e registrar a assinatura eletrônica do documento.
              </p>
              
              <form onSubmit={handleTutorSign} className="space-y-4 text-left">
                {submitError && (
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">
                    ⚠ {submitError}
                  </div>
                )}
                
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agree-checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="agree-checkbox" className="text-xs font-semibold text-slate-700 leading-tight cursor-pointer select-none">
                    Declaro que li e concordo com os termos descritos acima.
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tutor-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="tutor-name"
                      value={tutorName}
                      onChange={(e) => setTutorName(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="tutor-cpf" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      CPF do Tutor
                    </label>
                    <input
                      type="text"
                      id="tutor-cpf"
                      value={tutorCpf}
                      onChange={(e) => setTutorCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      disabled={submitting}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Registrando Assinatura...' : '✓ Aceitar e Assinar Termo'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm text-left">
              <div className="flex items-center gap-2.5 mb-2 text-emerald-700">
                <span className="text-lg">✓</span>
                <h3 className="text-sm font-bold">Termo Assinado Eletronicamente pelo Tutor</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-800 font-medium">
                <div>
                  <span className="font-bold text-emerald-900">Assinante:</span> {data.document.tutorSignatureName}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">CPF:</span> {data.document.tutorSignatureCpf}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Data/Hora:</span> {data.document.tutorSignedAt ? new Date(data.document.tutorSignedAt).toLocaleString('pt-BR') : ''}
                </div>
                <div>
                  <span className="font-bold text-emerald-900">Endereço IP:</span> {data.document.tutorSignatureIp}
                </div>
                <div className="md:col-span-2 text-[10px] text-emerald-700 mt-1 font-semibold leading-normal break-all">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider">Dispositivo/Navegador:</span> {data.document.tutorSignatureUserAgent}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
