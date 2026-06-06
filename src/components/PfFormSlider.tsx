import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import * as Slider from '@radix-ui/react-slider'

interface PfFormSliderProps {
  name: string
  label?: string
  min: number
  max: number
  step?: number
  showValue?: boolean
  'data-testid'?: string
}

let styleInjected = false

function injectStyles() {
  if (styleInjected) return
  if (typeof document === 'undefined') return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    .pf-slider-track {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 6px;
      background: var(--pf-bg-surface-alt);
      border-radius: var(--pf-radius-sm);
    }
    .pf-slider-range {
      position: absolute;
      height: 100%;
      background: var(--pf-accent);
      border-radius: var(--pf-radius-sm);
    }
    .pf-slider-thumb {
      display: block;
      width: 20px;
      height: 20px;
      background: var(--pf-accent);
      border: 2px solid var(--pf-bg-surface);
      border-radius: 50%;
      cursor: pointer;
      outline: none;
    }
    .pf-slider-thumb:focus-visible {
      box-shadow: 0 0 0 2px var(--pf-accent-muted);
    }
  `
  document.head.appendChild(style)
}

export function PfFormSlider({
  name,
  label,
  min,
  max,
  step = 1,
  showValue = false,
  'data-testid': dataTestId,
}: PfFormSliderProps) {
  const { control } = useFormContext()
  injectStyles()

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    marginBottom: '8px',
  }

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--pf-text-secondary)',
    fontFamily: 'var(--pf-font-ui)',
  }

  const rootStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '20px',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div style={{ marginBottom: '12px' }} data-testid={dataTestId}>
          {(label || showValue) && (
            <div style={labelStyle}>
              {label && <span>{label}</span>}
              {showValue && <span style={valueStyle}>{field.value ?? min}</span>}
            </div>
          )}
          <Slider.Root
            className="pf-slider-root"
            style={rootStyle}
            value={[field.value ?? min]}
            onValueChange={(values) => field.onChange(values[0])}
            min={min}
            max={max}
            step={step}
          >
            <Slider.Track className="pf-slider-track">
              <Slider.Range className="pf-slider-range" />
            </Slider.Track>
            <Slider.Thumb className="pf-slider-thumb" />
          </Slider.Root>
        </div>
      )}
    />
  )
}
