import { useFormContext, Controller } from 'react-hook-form'
import { PfSelect } from './PfSelect'
import { pfText } from '../tokens/type'

interface PfFormSelectProps {
  name: string
  label?: string
  options: Array<{ label: string; value: string }>
  placeholder?: string
  'data-testid'?: string
}

export function PfFormSelect({
  name,
  label,
  options,
  placeholder,
  'data-testid': dataTestId,
}: PfFormSelectProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div style={{ marginBottom: '12px' }} data-testid={dataTestId}>
          <PfSelect
            label={label}
            aria-label={label ? undefined : name}
            value={field.value ?? ''}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
          />
          {fieldState.error && (
            <div
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
