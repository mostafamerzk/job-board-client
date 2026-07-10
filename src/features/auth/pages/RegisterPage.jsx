import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'
import { useAuth } from '../../../hooks/useAuth.js'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState('candidate')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== passwordConfirmation) errs.passwordConfirmation = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    try {
      await register(name, email, password, passwordConfirmation, role)
	      navigate('/login', { replace: true })
    } catch (err) {
      if (err.status === 422 && err.body?.errors) {
        const fieldErrors = {}
        for (const [field, msgs] of Object.entries(err.body.errors)) {
          fieldErrors[field] = msgs.join(', ')
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      } else {
        setServerError('Connection error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 440 }}>
        <Card.Body className="p-4">
          <Card.Title className="mb-3">Create account</Card.Title>

          {serverError && (
            <Alert variant="danger" dismissible onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="register-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!!errors.name}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-password-confirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                isInvalid={!!errors.passwordConfirmation}
                disabled={isLoading}
              />
              <Form.Control.Feedback type="invalid">{errors.passwordConfirmation}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="register-role">
              <Form.Label>I want to</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="candidate">Find a job</option>
                <option value="employer">Hire talent</option>
              </Form.Select>
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mb-3"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </Form>

          <p className="text-center mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}
