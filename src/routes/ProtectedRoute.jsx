import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Spinner from 'react-bootstrap/Spinner'
import Container from 'react-bootstrap/Container'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60dvh' }}>
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
