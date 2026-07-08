import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { TriangleAlert } from 'lucide-react'

export function ConfirmDialog({
  show,
  onHide,
  onConfirm,
  title,
  body,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  children,
  isLoading = false,
  isDestructive = true,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isDestructive && (
          <div className="d-flex align-items-start gap-3">
            <TriangleAlert
              className="flex-shrink-0 mt-1"
              size={22}
              style={{ color: 'var(--status-error, #B94434)' }}
            />
            <div className="flex-grow-1">
              {body}
              {children}
            </div>
          </div>
        )}
        {!isDestructive && (
          <>
            {body}
            {children}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              {confirmLabel}
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
