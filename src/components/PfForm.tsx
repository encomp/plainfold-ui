import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, DefaultValues } from 'react-hook-form'
import type { ZodType } from 'zod'

interface PfFormProps<T extends FieldValues> {
  schema: ZodType<T>
  onSubmit: (data: T) => void
  defaultValues?: DefaultValues<T>
  children: React.ReactNode
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
