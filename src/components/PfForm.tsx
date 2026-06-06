import { type ReactNode } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, DefaultValues } from 'react-hook-form'

interface PfFormProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
  onSubmit: (data: T) => void
  defaultValues?: DefaultValues<T>
  children: ReactNode
}

export function PfForm<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
}: PfFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  )
}
