import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ShieldAlert, Users, Phone, Mail, Calendar, MessageSquare, AlertTriangle } from 'lucide-react'
import type { AnalyticsTrends } from '../../lib/api'

interface AlertsActionsTabProps {
  trends: AnalyticsTrends
}

export function AlertsActionsTab({ trends }: AlertsActionsTabProps) {
  const getDaysRemaining = (nextDoseDateStr: string | null | undefined) => {
    if (!nextDoseDateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextDose = new Date(nextDoseDateStr)
    nextDose.setHours(0, 0, 0, 0)
    
    const diffTime = nextDose.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getInactiveDays = (lastActiveDateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastActive = new Date(lastActiveDateStr)
    lastActive.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - lastActive.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  const renderVaccineBadge = (days: number | null) => {
    if (days === null) return null
    if (days === 0) return <span className="inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-bold text-destructive-foreground">Vence Hoje</span>
    if (days === 1) return <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white">Amanhã</span>
    return <span className="inline-flex items-center rounded-full border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-500">Em {days} dias</span>
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Vaccines */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Vacinas a Vencer (Próximos 7 Dias)
            </CardTitle>
            <CardDescription className="text-xs">
              Pacientes com vacinas agendadas para expirar nos próximos dias. Contate os tutores.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {trends.upcomingVaccinesList.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                Nenhuma vacina agendada para expirar nos próximos 7 dias.
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-[450px] overflow-y-auto">
                {trends.upcomingVaccinesList.map((vac) => {
                  const days = getDaysRemaining(vac.nextDoseDate)
                  return (
                    <div key={vac.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{vac.pet?.name}</span>
                          <span className="text-xs text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded font-bold tracking-wide">
                            {vac.name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p className="flex items-center gap-1.5">
                            <span className="font-medium">Tutor:</span> {vac.pet?.client?.name}
                          </p>
                          {(vac.pet?.client?.phone || vac.pet?.client?.email) && (
                            <p className="flex items-center gap-2 text-[11px] text-muted-foreground/80 mt-1">
                              {vac.pet.client.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {vac.pet.client.phone}
                                </span>
                              )}
                              {vac.pet.client.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {vac.pet.client.email}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        {renderVaccineBadge(days)}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled 
                          className="h-8 text-[11px] font-semibold border-border bg-background hover:bg-background cursor-not-allowed opacity-60 text-muted-foreground w-full sm:w-auto"
                          title="Lembretes automáticos em desenvolvimento (Fase 14)"
                        >
                          Lembrar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Clients */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-400" />
              Clientes Inativos (Sem consultas há 90+ dias)
            </CardTitle>
            <CardDescription className="text-xs">
              Clientes ausentes com maior urgência de contato para reengajamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {trends.inactiveClientsList.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                Nenhum cliente inativo há mais de 90 dias.
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-[450px] overflow-y-auto">
                {trends.inactiveClientsList.map((client) => {
                  const days = getInactiveDays(client.lastActiveDate)
                  return (
                    <div key={client.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground">{client.name}</span>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p className="flex items-center gap-1.5">
                            <span className="font-medium">Atividade:</span>{' '}
                            {client.hasAppointments ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                Última consulta em {formatDate(client.lastActiveDate)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 italic text-muted-foreground/80">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                Nunca consultou (cadastrado em {formatDate(client.lastActiveDate)})
                              </span>
                            )}
                          </p>
                          {(client.phone || client.email) && (
                            <p className="flex items-center gap-2 text-[11px] text-muted-foreground/80 mt-1">
                              {client.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {client.phone}
                                </span>
                              )}
                              {client.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {client.email}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-400">
                          {days} dias sem atividade
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled 
                          className="h-8 text-[11px] font-semibold border-border bg-background hover:bg-background cursor-not-allowed opacity-60 text-muted-foreground w-full sm:w-auto"
                          title="Lembretes automáticos em desenvolvimento (Fase 14)"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reativar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
