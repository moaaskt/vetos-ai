import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { LogIn, Building2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/EmptyState'

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
    } catch (e) {
      alert('Impersonation failed. Check console for details.')
      console.error(e)
    }
  }

  return (
    <div className="animate-in fade-in-0 duration-500">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Manage Clinics</h1>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Clinic Name</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">{clinic.name}</td>
                    <td className="px-6 py-4">{new Date(clinic.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImpersonate(clinic.id)}
                        className="gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Login as Clinic
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && clinics.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={Building2}
                title="No clinics found"
                description="There are no clinics matching the selected filter criteria."
              />
            </div>
          )}

          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
