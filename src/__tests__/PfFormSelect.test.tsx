import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PfFormSelect } from '../components/PfFormSelect'
import React from 'react'

const schema = z.object({
  color: z.string().optional(),
})

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
]

function TestForm({ children, defaultValues }: { children: React.ReactNode; defaultValues?: Record<string, unknown> }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { color: '' },
  })
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  )
}

describe('PfFormSelect', () => {
  it('renders with label', () => {
    render(
      <TestForm>
        <PfFormSelect name="color" label="Favorite Color" options={options} />
      </TestForm>
    )
    expect(screen.getByText('Favorite Color')).toBeInTheDocument()
  })

  it('shows placeholder', () => {
    render(
      <TestForm>
        <PfFormSelect name="color" options={options} placeholder="Choose a color" />
      </TestForm>
    )
    expect(screen.getByText('Choose a color')).toBeInTheDocument()
  })
})

describe('PfFormSelect on PfSelect', () => {
  it('shows the chosen option and puts the label on the trigger', () => {
    render(
      <TestForm defaultValues={{ color: 'blue' }}>
        <PfFormSelect name="color" label="Colour" options={options} />
      </TestForm>
    )
    expect(screen.getByRole('combobox', { name: 'Colour' })).toHaveTextContent('Blue')
  })
})
