import { Link } from 'react-router-dom'
import {
  Bell,
  Building2,
  Users,
  Sliders,
  ArrowRight,
  Settings,
  Syringe,
} from 'lucide-react'

export function SettingsPage() {
  const cards = [
    {
      to: '/settings/messaging',
      title: 'Mensageria e Notificações',
      description: 'Configure servidores de e-mail SMTP, simule WhatsApp, gerencie modelos de mensagens e acompanhe o histórico de envios com auditoria em tempo real.',
      icon: Bell,
      active: true,
      badge: 'Ativo',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      to: '/settings/vaccines',
      title: 'Protocolos Vacinais',
      description: 'Configure protocolos de vacinação padrão por espécie (Ex: cães e gatos) com intervalos de doses automáticos e sequenciais.',
      icon: Syringe,
      active: true,
      badge: 'Novo',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      to: '#',
      title: 'Perfil da Clínica',
      description: 'Edite as informações gerais da clínica, detalhes de contato, endereços, logo e horários de funcionamento operacional.',
      icon: Building2,
      active: false,
      badge: 'Em Breve',
      badgeClass: 'bg-muted text-muted-foreground border-border/80',
    },
    {
      to: '#',
      title: 'Equipe e Permissões',
      description: 'Gerencie os usuários do sistema, convide veterinários e secretários, e ajuste os níveis de acesso (RBAC) de cada membro.',
      icon: Users,
      active: false,
      badge: 'Em Breve',
      badgeClass: 'bg-muted text-muted-foreground border-border/80',
    },
    {
      to: '#',
      title: 'Preferências Gerais',
      description: 'Ajuste preferências de sistema, fusos horários locais, formatos de data e comportamento padrão de lembretes da agenda.',
      icon: Sliders,
      active: false,
      badge: 'Em Breve',
      badgeClass: 'bg-muted text-muted-foreground border-border/80',
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          Configurações da Clínica
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Gerencie e personalize o funcionamento geral da clínica, controle acessos e integre serviços externos de comunicação.
        </p>
      </div>

      {/* Grid Layout of Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          const content = (
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-1.5 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {card.active && (
                <div className="flex items-center gap-1 text-xs font-bold text-primary pt-4 group-hover:gap-2 transition-all">
                  <span>Acessar configurações</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          )

          if (card.active) {
            return (
              <Link
                key={idx}
                to={card.to}
                className="group block p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full"
              >
                {content}
              </Link>
            )
          }

          return (
            <div
              key={idx}
              className="p-6 bg-card/65 border border-border/60 rounded-2xl opacity-75 select-none h-full relative overflow-hidden"
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
