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
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">VetOS AI</h1>
            <p className="text-sm text-slate-400">Clinic operations dashboard</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">
              Access your clinic workspace and daily schedule.
            </p>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-teal-300"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-teal-300"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            New clinic?{' '}
            <Link className="font-medium text-teal-300 hover:text-teal-200" to="/register">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
