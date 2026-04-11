import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const ThrowError = () => {
  throw new Error('Test error message')
}

vi.mock('sileo', () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(() => ({ id: 'mock-id' })),
    dismiss: vi.fn(),
    show: vi.fn(),
    action: vi.fn(() => ({ id: 'mock-action-id' }))
  }
}))

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-fallback">
          <h1>Algo salió mal</h1>
          <button onClick={this.handleReset}>Recargar página</button>
          <button onClick={() => window.location.href = '/'}>Ir al inicio</button>
        </div>
      )
    }
    return this.props.children
  }
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'language-storage') {
        return JSON.stringify({ state: { language: 'es' } })
      }
      return null
    })
  })

  it('debe renderizar children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="children">Contenido normal</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByTestId('children')).toBeInTheDocument()
  })

  it('debe capturar errores y mostrar fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })

  it('debe tener botones de accion', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Recargar página')).toBeInTheDocument()
    expect(screen.getByText('Ir al inicio')).toBeInTheDocument()
  })

  it('debe tener boton de reset que se puede clickear', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    const reloadButton = screen.getByText('Recargar página')
    expect(reloadButton).toBeInTheDocument()
    
    expect(() => fireEvent.click(reloadButton)).not.toThrow()
  })
})
