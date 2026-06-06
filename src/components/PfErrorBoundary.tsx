import React from 'react'
import { PfCard } from './PfCard'
import { PfButton } from './PfButton'

interface PfErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode)
}

interface PfErrorBoundaryState {
  error: Error | null
}

export class PfErrorBoundary extends React.Component<PfErrorBoundaryProps, PfErrorBoundaryState> {
  constructor(props: PfErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): PfErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logging can be handled by the consuming app
    console.error('PfErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (error) {
      if (fallback !== undefined) {
        if (typeof fallback === 'function') {
          return <>{(fallback as (error: Error) => React.ReactNode)(error)}</>
        }
        return <>{fallback}</>
      }

      const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }

      const headingStyle: React.CSSProperties = {
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--pf-text-primary)',
        margin: '0 0 8px 0',
      }

      const messageStyle: React.CSSProperties = {
        fontSize: '14px',
        color: 'var(--pf-danger)',
        margin: '0 0 16px 0',
      }

      return (
        <div style={containerStyle}>
          <PfCard data-testid="error-boundary-fallback">
            <h3 style={headingStyle}>Something went wrong</h3>
            <p style={messageStyle} data-testid="error-message">{error.message}</p>
            <PfButton variant="primary" onClick={this.handleReset} data-testid="error-try-again">
              Try Again
            </PfButton>
          </PfCard>
        </div>
      )
    }

    return children
  }
}
