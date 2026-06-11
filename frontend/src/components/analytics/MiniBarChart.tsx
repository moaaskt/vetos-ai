import { useMemo } from 'react'

interface MiniBarChartProps {
  data: { date: string; count: number }[]
}

export function MiniBarChart({ data }: MiniBarChartProps) {
  const maxCount = useMemo(() => {
    const counts = data.map((d) => d.count)
    return Math.max(...counts, 1) // evitar divisão por zero
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
      <div className="overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-end justify-between gap-[4px] h-48 pt-6 px-1 border-b border-border/50 relative min-w-[340px] sm:min-w-0">
          {data.map((item) => {
            const percentage = (item.count / maxCount) * 100
            
            return (
              <div 
                key={item.date} 
                className="group relative flex-1 min-w-[6px] sm:min-w-0 flex flex-col items-center h-full justify-end cursor-pointer"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
                  <div className="bg-popover text-popover-foreground text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-border shadow-md whitespace-nowrap">
                    <span className="text-muted-foreground">{formatDate(item.date)}:</span>{' '}
                    <span className="text-primary font-bold">{item.count}</span> {item.count === 1 ? 'consulta' : 'consultas'}
                  </div>
                  <div className="w-1.5 h-1.5 bg-popover border-r border-b border-border rotate-45 -mt-1 shadow-sm" />
                </div>

                {/* Bar */}
                <div 
                  className="w-full bg-primary/25 group-hover:bg-gradient-to-t group-hover:from-primary group-hover:to-violet-500 rounded-t-[3px] transition-all duration-300 relative overflow-hidden"
                  style={{ height: `${percentage}%` }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Date Labels */}
      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 select-none">
        <span>Início ({data[0] ? formatDate(data[0].date) : ''})</span>
        <span>Meio ({data[15] ? formatDate(data[15].date) : ''})</span>
        <span>Fim ({data[data.length - 1] ? formatDate(data[data.length - 1].date) : ''})</span>
      </div>
    </div>
  )
}

