import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PfForm } from '../components/PfForm'
import { z } from 'zod'

describe('PfForm', () => {
  const schema = z.object({
    name: z.string().min(1),
  })

  it('renders children', () => {
    render(
      <PfForm schema={schema} onSubmit={() => {}}>
        <span>Form child</span>
      </PfForm>
    )
    expect(screen.getByText('Form child')).toBeInTheDocument()
  })

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn()
    render(
      <PfForm schema={schema} onSubmit={onSubmit} defaultValues={{ name: 'Alice' }}>
        <button type="submit">Submit</button>
      </PfForm>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice' }, expect.anything())
    })
  })
})
