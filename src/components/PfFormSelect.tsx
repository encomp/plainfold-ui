import { useId } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { PfSelect } from './PfSelect'
import { pfText } from '../tokens/type'

type PfFormSelectProps = {
  name: string
  options: Array<{ label: string; value: string }>
  placeholder?: string
  'data-testid'?: string
} & ({ label: string; 'aria-label'?: never } | { label?: never; 'aria-label': string })

export function PfFormSelect({
  name,
  label,
  'aria-label': ariaLabel,
  options,
  placeholder,
  'data-testid': dataTestId,
}: PfFormSelectProps) {
  const { control } = useFormContext()
  const errorId = useId()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div style={{ marginBottom: '12px' }} data-testid={dataTestId}>
          <PfSelect
            {...(label ? { label } : { 'aria-label': ariaLabel! })}
            invalid={!!fieldState.error}
            describedBy={fieldState.error ? errorId : undefined}
            value={field.value ?? ''}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
          />
          {fieldState.error && (
            <div
              id={errorId}
              role="alert"
              style={{
                fontSize: pfText.label,
                color: 'var(--pf-danger)',
                fontFamily: 'var(--pf-font-ui)',
                marginTop: '4px',
              }}
            >
              {fieldState.error.message}
            </div>
          )}
        </div>
      )}
    />
  )
}
