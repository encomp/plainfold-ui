import React from 'react'

interface ThemeIconProps {
  svg?: string
  fallback?: React.ReactNode
  size?: number
  style?: React.CSSProperties
  'data-testid'?: string
}

export function ThemeIcon({
  svg,
  fallback,
  size = 20,
  style,
  'data-testid': testId,
}: ThemeIconProps) {
  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: `${size}px`,
    height: `${size}px`,
    ...style,
  }

  if (svg) {
    return (
      <span
        style={wrapperStyle}
        data-testid={testId}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }

  if (fallback) {
    return (
      <span style={wrapperStyle} data-testid={testId}>
        {fallback}
      </span>
    )
  }

  return null
}
