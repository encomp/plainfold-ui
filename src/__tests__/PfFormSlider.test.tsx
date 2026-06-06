import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PfFormSlider } from '../components/PfFormSlider'
import React from 'react'

const schema = z.object({
  volume: z.number().min(0).max(100),
})

function TestForm({ children, defaultValues }: { children: React.ReactNode; defaultValues?: any }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { volume: 50 },
  })
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  )
}

describe('PfFormSlider', () => {
  it('renders with label', () => {
    render(
      <TestForm>
        <PfFormSlider name="volume" label="Volume" min={0} max={100} />
      </TestForm>
    )
    expect(screen.getByText('Volume')).toBeInTheDocument()
  })

  it('has slider role', () => {
    render(
      <TestForm>
        <PfFormSlider name="volume" min={0} max={100} />
      </TestForm>
    )
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })
})
