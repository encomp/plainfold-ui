import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PfFormSwitch } from '../components/PfFormSwitch'
import React from 'react'

const schema = z.object({
  notifications: z.boolean(),
})

function TestForm({ children, defaultValues }: { children: React.ReactNode; defaultValues?: any }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { notifications: false },
  })
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  )
}

describe('PfFormSwitch', () => {
  it('renders label', () => {
    render(
      <TestForm>
        <PfFormSwitch name="notifications" label="Enable Notifications" />
      </TestForm>
    )
    expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
  })

  it('toggles on click', () => {
    render(
      <TestForm>
        <PfFormSwitch name="notifications" label="Notifications" />
      </TestForm>
    )
    const switchEl = screen.getByRole('switch')
    expect(switchEl).toHaveAttribute('data-state', 'unchecked')
    fireEvent.click(switchEl)
    expect(switchEl).toHaveAttribute('data-state', 'checked')
  })

  it('shows description', () => {
    render(
      <TestForm>
        <PfFormSwitch
          name="notifications"
          label="Notifications"
          description="Receive email alerts"
        />
      </TestForm>
    )
    expect(screen.getByText('Receive email alerts')).toBeInTheDocument()
  })
})
