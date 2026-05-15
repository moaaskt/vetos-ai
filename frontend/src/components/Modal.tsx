import { X } from 'lucide-react'

type ModalProps = {
  title: string
  children: React.ReactNode
  onClose: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
