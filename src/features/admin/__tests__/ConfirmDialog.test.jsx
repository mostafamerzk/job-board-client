import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'

function renderDialog(props = {}) {
  const defaultProps = {
    show: true,
    onHide: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Title',
    body: 'Are you sure?',
  }
  return render(<ConfirmDialog {...defaultProps} {...props} />)
}

describe('ConfirmDialog', () => {
  it('renders the modal when show is true', () => {
    renderDialog()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('does not render when show is false', () => {
    renderDialog({ show: false })
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('calls onHide when Cancel is clicked', async () => {
    const onHide = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onHide })

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onHide).toHaveBeenCalled()
  })

  it('calls onConfirm when Confirm is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onConfirm })

    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('shows custom confirm label', () => {
    renderDialog({ confirmLabel: 'Delete' })
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows spinner when isLoading is true', () => {
    renderDialog({ isLoading: true })
    const confirmBtn = screen.getByRole('button', { name: /confirm/i })
    expect(confirmBtn).toBeDisabled()
    expect(confirmBtn.querySelector('.spinner-border')).toBeInTheDocument()
  })

  it('disables cancel button when isLoading is true', () => {
    renderDialog({ isLoading: true })
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('shows warning icon when isDestructive is true', () => {
    renderDialog({ isDestructive: true })
    // TriangleAlert icon renders an SVG
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderDialog({ children: <input placeholder="Reason" /> })
    expect(screen.getByPlaceholderText('Reason')).toBeInTheDocument()
  })
})
