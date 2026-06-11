import { Link } from 'react-router-dom'
import {
  Bell,
  Mail,
  MessageSquare,
  FileText,
  History,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'

export function MessagingHubPage() {
  const hubItems = [
    {
      title: 'Servidor de E-mail (SMTP)',
      description: 'Configure servidores SMTP reais para envios de e-mails administrativos.',
      icon: Mail,
      href: '/settings/messaging/smtp',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'WhatsApp (Evolution API)',
      description: 'Gerencie instâncias de WhatsApp, pareamento por QR Code e conexões reais.',
      icon: MessageSquare,
      href: '/settings/messaging/whatsapp',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Modelos de Mensagem (Templates)',
      description: 'Customize e-mails e mensagens de lembretes ou consultas.',
      icon: FileText,
      href: '/settings/messaging/templates',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Histórico de Envios (Logs)',
      description: 'Monitore o status de cada notificação entregue e tente reenvios.',
      icon: History,
      href: '/settings/messaging/logs',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/settings" className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="h-3 w-3" />
              Configurações
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Mensageria e Notificações</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            Mensageria e Notificações
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Gerencie servidores de e-mail, automatize templates e monitore o status de envio de notificações da clínica.
          </p>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.title}
              to={item.href}
              className="group block bg-card hover:bg-muted/40 rounded-2xl border border-border/80 hover:border-border p-6 shadow-sm hover:shadow transition-all duration-200 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 flex-1 pr-6">
                  <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary absolute right-6 top-1/2 -translate-y-1/2 transition-all group-hover:translate-x-1" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
