import { useState, useEffect } from 'react'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export function ToastNotification({ message, variant = 'success', onClose }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(true)
  }, [message])

  const handleClose = () => {
    setShow(false)
    onClose?.()
  }

  if (!message) return null

  const isSuccess = variant === 'success'

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1080 }}>
      <Toast
        show={show}
        onClose={handleClose}
        delay={3500}
        autohide
        className="employer-toast"
      >
        <Toast.Header
          closeButton
          style={{
            background: isSuccess ? 'var(--status-success)' : 'var(--status-error)',
            color: '#fff',
            borderBottom: 0,
          }}
        >
          {isSuccess
            ? <CheckCircle2 size={16} aria-hidden="true" className="me-2" />
            : <AlertCircle size={16} aria-hidden="true" className="me-2" />}
          <strong className="me-auto">{isSuccess ? 'Success' : 'Error'}</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}
