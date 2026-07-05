import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilters } from '../components/SearchFilters.jsx'

test('renders keyword search input', () => {
  render(<SearchFilters onFilterChange={vi.fn()} initialFilters={{}} />)
  expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
})

test('renders work type, experience level, and location filters', () => {
  render(<SearchFilters onFilterChange={vi.fn()} initialFilters={{}} />)
  expect(screen.getByLabelText(/work type/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
})

test('calls onFilterChange when work type changes', async () => {
  const onChange = vi.fn()
  const user = userEvent.setup()
  render(<SearchFilters onFilterChange={onChange} initialFilters={{}} />)

  await user.selectOptions(screen.getByLabelText(/work type/i), 'remote')
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ work_type: 'remote' }))
})
