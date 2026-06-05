import { useMemo } from 'react'

interface NotificationTrendChartProps {
  data: { date: string; sent: number; failed: number }[]
}

export function NotificationTrendChart({ data }: NotificationTrendChartProps) {
  const maxTotal = useMemo(() => {
    const totals = data.map((d) => d.sent + d.failed)
    return Math.max(...totals, 1) // evitar divisão por zero
  }, [data])

  const formatDate = (dateStr: string) => {
    try {
      const [, month, day] = dateStr.split('-')
      return `${day}/${month}`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex items-end justify-between gap-[3px] sm:gap-[5px] h-48 pt-6 px-1 border-b border-border/50 relative">
        {data.map((item) => {
          const total = item.sent + item.failed
          const percentageTotal = (total / maxTotal) * 100
          
          const sentPercentage = total > 0 ? (item.sent / total) * 100 : 0
          const failedPercentage = total > 0 ? (item.failed / total) * 100 : 0
          
          return (
            <div 
              key={item.date} 
              className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
                <div className="bg-popover text-popover-foreground text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-border shadow-md whitespace-nowrap space-y-1">
                  <div className="text-muted-foreground border-b border-border/50 pb-0.5 mb-1 text-center font-bold">
                    {formatDate(item.date)}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Sucesso: {item.sent}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Falhas: {item.failed}</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-popover border-r border-b border-border rotate-45 -mt-1 shadow-sm" />
              </div>

              {/* Stacked Bar Container */}
              <div 
                className="w-full rounded-t-[3px] transition-all duration-300 relative overflow-hidden flex flex-col justify-end"
                style={{ height: `${percentageTotal}%` }}
              >
                {/* Failed Portion */}
                {item.failed > 0 && (
                  <div 
                    className="w-full bg-rose-500/70 group-hover:bg-rose-500 transition-colors"
                    style={{ height: `${failedPercentage}%` }}
                  />
                )}
                {/* Sent Portion */}
                {item.sent > 0 && (
                  <div 
                    className="w-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors"
                    style={{ height: `${sentPercentage}%` }}
                  />
                )}
                
                {/* Thin base indicator for days with zero messages */}
                {total === 0 && (
                  <div className="w-full h-[2px] bg-secondary hover:bg-muted-foreground/20" />
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Date Labels */}
      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <span>Início ({data[0] ? formatDate(data[0].date) : ''})</span>
        <span>Meio ({data[15] ? formatDate(data[15].date) : ''})</span>
        <span>Fim ({data[data.length - 1] ? formatDate(data[data.length - 1].date) : ''})</span>
      </div>
    </div>
  )
}
