import Badge from 'react-bootstrap/Badge'

export function StatusPill({ label }) {
  return (
    <Badge bg="light" text="dark" className="status-pill">
      {label}
    </Badge>
  )
}
