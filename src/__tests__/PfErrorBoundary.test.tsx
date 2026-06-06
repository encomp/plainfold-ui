import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfErrorBoundary } from '../components/PfErrorBoundary'

// A component that throws an error on demand
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div data-testid="child">Healthy child</div>
}

describe('PfErrorBoundary', () => {
  // Suppress React error boundary console output during tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children normally when no error', () => {
    render(
      <PfErrorBoundary>
        <div data-testid="child">Hello</div>
      </PfErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('catches error and shows default fallback', () => {
    render(
      <PfErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </PfErrorBoundary>
    )
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error message')
    expect(screen.getByTestId('error-try-again')).toBeInTheDocument()
  })

  it('catches error and shows custom ReactNode fallback', () => {
    render(
      <PfErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </PfErrorBoundary>
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('catches error and calls custom fallback function', () => {
    render(
      <PfErrorBoundary
        fallback={(error: Error) => (
          <div data-testid="fn-fallback">Error: {error.message}</div>
        )}
      >
        <ThrowingComponent shouldThrow={true} />
      </PfErrorBoundary>
    )
    expect(screen.getByTestId('fn-fallback')).toBeInTheDocument()
    expect(screen.getByText('Error: Test error message')).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', () => {
    // We need a component that can toggle the error
    let shouldThrow = true

    function ToggleThrow() {
      if (shouldThrow) {
        throw new Error('Oops')
      }
      return <div data-testid="recovered">Recovered</div>
    }

    const { rerender } = render(
      <PfErrorBoundary>
        <ToggleThrow />
      </PfErrorBoundary>
    )

    // Should show error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Fix the error condition before clicking Try Again
    shouldThrow = false

    // Click Try Again
    fireEvent.click(screen.getByTestId('error-try-again'))

    // Should re-render children
    expect(screen.getByTestId('recovered')).toBeInTheDocument()
  })
})
