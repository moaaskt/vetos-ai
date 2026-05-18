import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await login(email, password)
      navigate(user?.role === 'SUPERADMIN' ? '/super-admin/dashboard' : '/dashboard')
    } catch {
      setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <section className="w-full max-w-md animate-in fade-in-0 duration-500">
        <div className="mb-8 flex items-center gap-3 justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm font-bold">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">VetOS AI</h1>
            <p className="text-xs text-primary font-medium tracking-wide uppercase">Gestão veterinária inteligente</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-8 shadow-[0_22px_70px_-44px_rgba(0,0,0,0.75)] space-y-6"
        >
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Acessar Sistema</h2>
            <p className="text-xs text-muted-foreground">
              Acesse o ambiente de gestão da sua clínica e prontuários de pacientes.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail Profissional</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition placeholder:text-muted-foreground/60 focus:border-primary text-foreground shadow-sm"
                type="email"
                placeholder="medico@clinica.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha de Acesso</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition placeholder:text-muted-foreground/60 focus:border-primary text-foreground shadow-sm"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
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
            {isSubmitting ? 'Autenticando...' : 'Entrar na Conta'}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
            Nova clínica parceira?{' '}
            <Link className="font-semibold text-primary hover:opacity-80 transition-colors" to="/register">
              Cadastre sua unidade
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
