import { Mail, MessageSquare } from 'lucide-react'

interface ChannelDistributionProps {
  data: {
    EMAIL: number
    WHATSAPP: number
  }
}

export function ChannelDistribution({ data }: ChannelDistributionProps) {
  const total = data.EMAIL + data.WHATSAPP

  const emailPercentage = total > 0 ? Math.round((data.EMAIL / total) * 100) : 0
  const whatsappPercentage = total > 0 ? Math.round((data.WHATSAPP / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">E-mail</span>
            <span className="text-xl font-bold text-foreground">
              {data.EMAIL}{' '}
              <span className="text-xs font-medium text-muted-foreground">envios</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">WhatsApp</span>
            <span className="text-xl font-bold text-foreground">
              {data.WHATSAPP}{' '}
              <span className="text-xs font-medium text-muted-foreground">envios</span>
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Horizontal Split Bar */}
        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
          {data.EMAIL > 0 && (
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500 relative group"
              style={{ width: `${emailPercentage}%` }}
              title={`E-mail: ${emailPercentage}%`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {data.WHATSAPP > 0 && (
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 relative group"
              style={{ width: `${whatsappPercentage}%` }}
              title={`WhatsApp: ${whatsappPercentage}%`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {total === 0 && (
            <div className="h-full w-full bg-muted/30 flex items-center justify-center text-[10px] font-semibold text-muted-foreground italic">
              Nenhuma notificação enviada no período
            </div>
          )}
        </div>
        
        {total > 0 && (
          <div className="flex justify-between text-[11px] font-bold tracking-wide">
            <span className="text-sky-400">{emailPercentage}% E-mail</span>
            <span className="text-emerald-400">{whatsappPercentage}% WhatsApp</span>
          </div>
        )}
      </div>
    </div>
  )
}
