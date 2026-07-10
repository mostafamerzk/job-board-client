import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export function ConfirmModal({
  show,
  onConfirm,
  onCancel,
  title = 'Confirm action',
  body = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  children,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children || <p className="mb-0">{body}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Processing…' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
