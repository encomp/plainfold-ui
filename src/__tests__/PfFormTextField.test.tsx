import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PfFormTextField } from '../components/PfFormTextField'
import React from 'react'

const schema = z.object({
  email: z.string().email('Invalid email'),
})

function TestForm({ children, defaultValues }: { children: React.ReactNode; defaultValues?: Record<string, unknown> }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { email: '' },
  })
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  )
}

describe('PfFormTextField', () => {
  it('renders label', () => {
    render(
      <TestForm>
        <PfFormTextField name="email" label="Email Address" />
      </TestForm>
    )
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('shows error from form context', async () => {
    function FormWithSubmit() {
      const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: 'not-email' },
      })
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <PfFormTextField name="email" label="Email" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      )
    }

    render(<FormWithSubmit />)
    // Clear the default value and submit with invalid data
    const input = screen.getByRole('textbox')
    // The default value 'not-email' is invalid, trigger validation
    const { fireEvent, waitFor } = await import('@testing-library/react')
    fireEvent.change(input, { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('type attribute works', () => {
    render(
      <TestForm>
        <PfFormTextField name="email" type="email" data-testid="email-input" />
      </TestForm>
    )
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email')
  })
})
