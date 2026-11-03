import React, { type CSSProperties } from 'react'
import { pfText } from '../tokens/type'
import { handleNavClick } from '../utils/handleNavClick'

export interface PfActionLinkProps {
  href: string
  children: React.ReactNode
  kind?: 'action' | 'back'
  onNavigate?: (href: string) => void
  external?: boolean
  'aria-label'?: string
  'data-testid'?: string
}

const srOnly: CSSProperties = {
  position: 'absolute', width: 1, height: 1, margin: -1, padding: 0,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
}

const css = `.pf-action-link:hover,.pf-action-link:focus-visible{text-decoration:underline!important;text-underline-offset:3px}.pf-action-link-back:hover{color:var(--pf-text-primary)!important}.pf-action-link:focus-visible{outline:2px solid var(--pf-accent-text, var(--pf-accent));outline-offset:2px}`

export function PfActionLink({
  href,
  children,
  kind = 'action',
  onNavigate,
  external = false,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: PfActionLinkProps) {
  const back = kind === 'back'
  return (
    <>
      <style>{css}</style>
      <a
        href={href}
        className={back ? 'pf-action-link pf-action-link-back' : 'pf-action-link'}
        style={{
          color: back ? 'var(--pf-text-muted)' : 'var(--pf-accent-text, var(--pf-accent))',
          fontSize: pfText.meta,
          fontWeight: 500,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onClick={external ? undefined : (e) => handleNavClick(e, href, onNavigate)}
        aria-label={ariaLabel && external ? `${ariaLabel} (opens in a new tab)` : ariaLabel}
        data-testid={dataTestId}
      >
        {back && <span aria-hidden="true">← </span>}
        {children}
        {external && <span style={srOnly}> (opens in a new tab)</span>}
        {!back && <span aria-hidden="true"> →</span>}
      </a>
    </>
  )
}
