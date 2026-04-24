import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function ToastContainer({ toasts }) {
  const icons = {
    success: <CheckCircle size={18} color="#6ee7b7" />,
    error: <XCircle size={18} color="var(--s-tertiary)" />,
    info: <Info size={18} color="var(--s-primary)" />
  }

  return (
    <div className="toast-stack">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icons[toast.type] || <Info size={18} color="var(--s-primary)" />}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
