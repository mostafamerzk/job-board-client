import Pag from 'react-bootstrap/Pagination'

export function Pagination({ currentPage, lastPage, onPageChange }) {
  function getPageNumbers() {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(lastPage, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (start > 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (end < lastPage) {
      pages.push('...')
      pages.push(lastPage)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav aria-label="Job list pagination">
      <Pag className="justify-content-center mt-4">
        <Pag.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {pages.map((page, idx) =>
          page === '...' ? (
            <Pag.Ellipsis key={`ellipsis-${idx}`} disabled />
          ) : (
            <Pag.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pag.Item>
          )
        )}
        <Pag.Next
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </Pag>
    </nav>
  )
}
