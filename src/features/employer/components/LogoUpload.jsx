import { useState, useRef, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import { ImagePlus, Upload } from 'lucide-react'
import { getProfile, uploadLogo } from '../api/employerApi.js'

const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export function LogoUpload({ onSuccess }) {
  const [currentLogo, setCurrentLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((res) => {
        if (!cancelled && res?.data?.logo_url) {
          setCurrentLogo(res.data.logo_url)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  function validateFile(file) {
    if (!file) return 'Please select a file'
    if (!file.type.startsWith('image/')) return 'File must be an image'
    if (file.size > MAX_SIZE_BYTES) return `File must be under ${MAX_SIZE_MB}MB`
    return null
  }

  function handleFile(file) {
    setError('')
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setError('')
    try {
      const res = await uploadLogo(selectedFile)
      setCurrentLogo(res?.data?.logo_url || preview)
      setSelectedFile(null)
      setPreview(null)
      onSuccess?.('Logo uploaded successfully')
    } catch (err) {
      setError(err.body?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const displayImage = preview || currentLogo

  return (
    <Card className="employer-panel h-100">
      <Card.Body>
        <div className="panel-header">
          <ImagePlus size={21} aria-hidden="true" />
          <h3>Company logo</h3>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <div className="logo-upload-area">
          {displayImage && (
            <div className="logo-preview-container">
              <img src={displayImage} alt="Company logo preview" className="logo-preview" />
            </div>
          )}

          <div
            className={`logo-drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
            aria-label="Upload company logo"
          >
            <Upload size={24} aria-hidden="true" />
            <p>
              <strong>Click to upload</strong> or drag and drop
            </p>
            <span>Image files, max {MAX_SIZE_MB}MB</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {selectedFile && (
          <div className="mt-3 d-flex align-items-center gap-2">
            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
            </span>
            <Button className="btn-brand" size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                'Upload'
              )}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => { setSelectedFile(null); setPreview(null) }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
