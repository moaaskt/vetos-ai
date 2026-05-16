import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { LogIn } from 'lucide-react'

type Clinic = {
  id: string
  name: string
  createdAt: string
}

export function SuperAdminClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { impersonate } = useAuth()

  useEffect(() => {
    async function loadClinics() {
      try {
        // Mocking clinics list since we don't have a clinics controller for superadmin yet.
        // In a real scenario, this would call /super-admin/clinics
        const response = await api.get<{id: string, name: string, createdAt: string}[]>('/clinics')
        setClinics(response.data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    loadClinics()
  }, [])

  const handleImpersonate = async (clinicId: string) => {
    try {
      await impersonate(clinicId)
      // Redirect handled by router due to state change
    } catch (e) {
      alert('Impersonation failed. Check console for details.')
      console.error(e)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Manage Clinics</h1>
      
      {isLoading ? (
        <p className="text-slate-400">Loading clinics...</p>
      ) : clinics.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center">
          <p className="text-lg font-medium text-white">No clinics found</p>
          <p className="mt-2 text-sm text-slate-400">There are no clinics matching the selected filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-slate-900">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-white/5 text-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Clinic Name</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">{clinic.name}</td>
                  <td className="px-4 py-3">{new Date(clinic.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleImpersonate(clinic.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-teal-300"
                    >
                      <LogIn className="h-3 w-3" />
                      Login as Clinic
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
