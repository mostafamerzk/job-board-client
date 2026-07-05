import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../components/Pagination.jsx'

test('renders page numbers and prev/next buttons', () => {
  render(<Pagination currentPage={1} lastPage={5} onPageChange={vi.fn()} />)
  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
  // When disabled, react-bootstrap renders a <span> not a <button>
  expect(screen.getByText(/previous/i).closest('.page-item')).toHaveClass('disabled')
  expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
})

test('calls onPageChange with clicked page number', async () => {
  const onChange = vi.fn()
  const user = userEvent.setup()
  render(<Pagination currentPage={1} lastPage={5} onPageChange={onChange} />)

  await user.click(screen.getByText('2'))
  expect(onChange).toHaveBeenCalledWith(2)
})

test('disables next on last page', () => {
  render(<Pagination currentPage={5} lastPage={5} onPageChange={vi.fn()} />)
  expect(screen.getByText(/next/i).closest('.page-item')).toHaveClass('disabled')
})
