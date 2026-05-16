import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, PawPrint } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [clinicName, setClinicName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await register(clinicName, email, password)
      navigate(user?.role === 'SUPERADMIN' ? '/super-admin/dashboard' : '/dashboard')
    } catch {
      setError('Não foi possível cadastrar esta unidade. Verifique se o e-mail já está em uso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-slate-100 font-sans selection:bg-teal-500/20 selection:text-teal-300">
      <section className="w-full max-w-lg animate-in fade-in-0 duration-500">
        <div className="mb-8 flex items-center gap-3 justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">VetOS AI</h1>
            <p className="text-xs text-teal-400 font-semibold tracking-wide uppercase">Criação de Ambiente Hospitalar</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3.5 pb-2 border-b border-white/10">
            <div className="h-10 w-10 rounded-lg bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Cadastrar Clínica / Hospital</h2>
              <p className="text-xs text-slate-400">Configure a unidade de atendimento e o primeiro administrador.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Nome da Unidade Veterinária</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-600 focus:border-teal-400 text-white shadow-inner"
                placeholder="Hospital Veterinário Central"
                value={clinicName}
                onChange={(event) => setClinicName(event.target.value)}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">E-mail do Gestor / Responsável Técnico</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-600 focus:border-teal-400 text-white shadow-inner"
                type="email"
                placeholder="diretor@hospitalvet.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Senha de Segurança</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-600 focus:border-teal-400 text-white shadow-inner"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-3 text-xs font-semibold text-red-200 text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:from-teal-300 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Configurando ambiente...' : 'Criar Ambiente da Clínica'}
          </button>

          <p className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            A unidade já possui cadastro?{' '}
            <Link className="font-bold text-teal-300 hover:text-teal-200 transition-colors" to="/login">
              Acessar painel
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
