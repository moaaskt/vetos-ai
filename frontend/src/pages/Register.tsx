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
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <section className="w-full max-w-lg animate-in fade-in-0 duration-500">
        <div className="mb-8 flex items-center gap-3 justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm font-bold">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">VetOS AI</h1>
            <p className="text-xs text-primary font-medium tracking-wide uppercase">Criação de ambiente hospitalar</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-8 shadow-[0_22px_70px_-44px_rgba(0,0,0,0.75)] space-y-6"
        >
          <div className="flex items-center gap-3.5 pb-2 border-b border-border">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Cadastrar Clínica / Hospital</h2>
              <p className="text-xs text-muted-foreground">Configure a unidade de atendimento e o primeiro administrador.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome da Unidade Veterinária</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition placeholder:text-muted-foreground/60 focus:border-primary text-foreground shadow-sm"
                placeholder="Hospital Veterinário Central"
                value={clinicName}
                onChange={(event) => setClinicName(event.target.value)}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail do Gestor / Responsável Técnico</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition placeholder:text-muted-foreground/60 focus:border-primary text-foreground shadow-sm"
                type="email"
                placeholder="diretor@hospitalvet.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha de Segurança</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition placeholder:text-muted-foreground/60 focus:border-primary text-foreground shadow-sm"
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
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-3 text-xs font-semibold text-destructive text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Configurando ambiente...' : 'Criar Ambiente da Clínica'}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
            A unidade já possui cadastro?{' '}
            <Link className="font-semibold text-primary hover:opacity-80 transition-colors" to="/login">
              Acessar painel
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
