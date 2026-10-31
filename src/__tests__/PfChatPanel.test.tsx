import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { PfChatPanel } from '../components/PfChatPanel'
import type { PfChatPanelProps, PfChatMessage } from '../components/PfChatPanel'

const messages: PfChatMessage[] = [
  { id: 'm1', role: 'user', text: 'Hello there' },
  {
    id: 'm2',
    role: 'assistant',
    text: 'Hi, how can I help?',
    meta: 'Model A · $0.002',
    sources: [{ label: 'Doc one', href: 'https://example.com/1' }, { label: 'Plain source' }],
  },
  { id: 'm3', role: 'assistant', text: 'Thinking', pending: true },
  { id: 'm4', role: 'assistant', text: 'Half an answer', error: 'It broke' },
]

function setup(props: Partial<PfChatPanelProps> = {}) {
  const p: PfChatPanelProps = {
    mode: 'docked',
    onModeChange: vi.fn(),
    messages: [],
    status: 'idle',
    draft: '',
    onDraftChange: vi.fn(),
    onSend: vi.fn(),
    ...props,
  }
  return { p, ...render(<PfChatPanel {...p} />) }
}

// jsdom has no PointerEvent, so clientX would be dropped from pointer events.
if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = class extends MouseEvent {} as unknown as typeof PointerEvent
}

afterEach(() => {
  window.innerWidth = 1024
})

describe('PfChatPanel', () => {
  it('renders nothing when hidden', () => {
    const { container } = setup({ mode: 'hidden' })
    expect(container).toBeEmptyDOMElement()
  })

  it('shows title and slots when docked', () => {
    setup({
      title: 'Ask',
      header: <span>head-slot</span>,
      context: <span>context-slot</span>,
      footer: <span>footer-slot</span>,
    })
    expect(screen.getByRole('heading', { name: 'Ask' })).toBeInTheDocument()
    expect(screen.getByText('head-slot')).toBeInTheDocument()
    expect(screen.getByText('context-slot')).toBeInTheDocument()
    expect(screen.getByText('footer-slot')).toBeInTheDocument()
  })

  it('defaults the title to Chat', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Chat' })).toBeInTheDocument()
  })

  it('has a message log', () => {
    setup({ messages })
    expect(screen.getByRole('log')).toBe(screen.getByTestId('pf-chat-messages'))
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite')
  })

  it('shows meta, sources, pending and error on messages', () => {
    setup({ messages })
    const m2 = screen.getByTestId('pf-chat-message-m2')
    expect(within(m2).getByText('Model A · $0.002')).toBeInTheDocument()
    const link = within(m2).getByRole('link', { name: 'Doc one' })
    expect(link).toHaveAttribute('href', 'https://example.com/1')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(within(m2).getByText('Plain source')).toBeInTheDocument()
    expect(within(m2).queryByRole('link', { name: 'Plain source' })).toBeNull()
    expect(within(screen.getByTestId('pf-chat-message-m3')).getByLabelText('Typing')).toBeTruthy()
    expect(within(screen.getByTestId('pf-chat-message-m4')).getByText('It broke')).toBeVisible()
  })

  it('renders message actions only on non-pending assistant messages', () => {
    setup({ messages, renderMessageActions: (m) => <button>act-{m.id}</button> })
    expect(screen.getByText('act-m2')).toBeInTheDocument()
    expect(screen.getByText('act-m4')).toBeInTheDocument()
    expect(screen.queryByText('act-m1')).toBeNull()
    expect(screen.queryByText('act-m3')).toBeNull()
  })

  it('shows the empty state when there are no messages', () => {
    setup({ emptyState: <p>Nothing yet</p> })
    expect(screen.getByText('Nothing yet')).toBeInTheDocument()
  })

  it('does not show the empty state when there are messages', () => {
    setup({ messages, emptyState: <p>Nothing yet</p> })
    expect(screen.queryByText('Nothing yet')).toBeNull()
  })

  it('reports draft changes', () => {
    const { p } = setup()
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'abc' } })
    expect(p.onDraftChange).toHaveBeenCalledWith('abc')
  })

  it('sends trimmed text on Enter', () => {
    const { p } = setup({ draft: '  hi  ' })
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
    expect(p.onSend).toHaveBeenCalledWith('hi')
  })

  it('does not send on Shift+Enter', () => {
    const { p } = setup({ draft: 'hi' })
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', shiftKey: true })
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('sends with the Send button and never sends empty text', () => {
    const { p, rerender } = setup({ draft: 'hello' })
    fireEvent.click(screen.getByTestId('pf-chat-send'))
    expect(p.onSend).toHaveBeenCalledWith('hello')
    ;(p.onSend as ReturnType<typeof vi.fn>).mockClear()
    rerender(<PfChatPanel {...p} draft="   " />)
    fireEvent.click(screen.getByTestId('pf-chat-send'))
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('disables Send and ignores Enter while sending', () => {
    const { p } = setup({ draft: 'hi', status: 'sending' })
    expect(screen.getByTestId('pf-chat-send')).toBeDisabled()
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('shows an error node in an alert', () => {
    setup({ status: 'error', error: <a href="/settings">Add a key</a> })
    const alert = screen.getByRole('alert')
    expect(within(alert).getByRole('link', { name: 'Add a key' })).toBeInTheDocument()
  })

  it('shows no alert without an error', () => {
    setup({ status: 'idle', error: 'stale' })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('opens the menu, fires onSelect and closes', () => {
    const onSelect = vi.fn()
    setup({ menuItems: [{ id: 'export', label: 'Export', onSelect }] })
    const btn = screen.getByTestId('pf-chat-menu')
    expect(btn).toHaveAttribute('aria-haspopup', 'menu')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Export' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes the menu with Escape and returns focus to the button', () => {
    const { p } = setup({ menuItems: [{ id: 'x', label: 'X', onSelect: vi.fn() }] })
    const btn = screen.getByTestId('pf-chat-menu')
    fireEvent.click(btn)
    const item = screen.getByTestId('pf-chat-menu-x')
    item.focus()
    fireEvent.keyDown(item, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(btn).toHaveFocus()
    expect(p.onModeChange).not.toHaveBeenCalled()
  })

  it('closes the menu on an outside click', () => {
    setup({ menuItems: [{ id: 'x', label: 'X', onSelect: vi.fn() }] })
    fireEvent.click(screen.getByTestId('pf-chat-menu'))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('hides the menu button when there are no menu items', () => {
    setup()
    expect(screen.queryByTestId('pf-chat-menu')).toBeNull()
  })

  it('stops Escape from leaving the panel', () => {
    const outer = vi.fn()
    document.addEventListener('keydown', outer)
    setup()
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Escape' })
    document.removeEventListener('keydown', outer)
    expect(outer).not.toHaveBeenCalled()
  })

  it('closes with the Close button', () => {
    const { p } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(p.onModeChange).toHaveBeenCalledWith('hidden')
  })

  it('expands from docked and docks from expanded', () => {
    const { p, rerender } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }))
    expect(p.onModeChange).toHaveBeenCalledWith('expanded')
    rerender(<PfChatPanel {...p} mode="expanded" />)
    fireEvent.click(screen.getByRole('button', { name: 'Dock chat' }))
    expect(p.onModeChange).toHaveBeenLastCalledWith('docked')
  })

  it('shows the summary only when expanded', () => {
    const { p, rerender } = setup({ summary: <div>summary-strip</div> })
    expect(screen.queryByText('summary-strip')).toBeNull()
    rerender(<PfChatPanel {...p} mode="expanded" />)
    expect(screen.getByText('summary-strip')).toBeInTheDocument()
  })

  it('docked is as wide as width, default 380, and expanded has no resize handle', () => {
    const { p, rerender } = setup()
    expect(screen.getByTestId('pf-chat')).toHaveStyle({ width: '380px' })
    rerender(<PfChatPanel {...p} width={500} />)
    expect(screen.getByTestId('pf-chat')).toHaveStyle({ width: '500px' })
    rerender(<PfChatPanel {...p} mode="expanded" />)
    expect(screen.queryByTestId('pf-chat-resize')).toBeNull()
  })

  it('exposes a keyboard-resizable separator', () => {
    const onWidthChange = vi.fn()
    const { p, rerender } = setup({ width: 400, onWidthChange })
    const sep = screen.getByRole('separator')
    expect(sep).toBe(screen.getByTestId('pf-chat-resize'))
    expect(sep).toHaveAttribute('aria-orientation', 'vertical')
    expect(sep).toHaveAttribute('aria-valuenow', '400')
    expect(sep).toHaveAttribute('aria-valuemin', '280')
    expect(sep).toHaveAttribute('aria-valuemax', '720')
    expect(sep).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(sep, { key: 'ArrowLeft' })
    expect(onWidthChange).toHaveBeenLastCalledWith(420)
    fireEvent.keyDown(sep, { key: 'ArrowRight' })
    expect(onWidthChange).toHaveBeenLastCalledWith(380)
    rerender(<PfChatPanel {...p} width={710} />)
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' })
    expect(onWidthChange).toHaveBeenLastCalledWith(720)
    rerender(<PfChatPanel {...p} width={290} />)
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' })
    expect(onWidthChange).toHaveBeenLastCalledWith(280)
  })

  it('resizes by dragging the handle left to widen', () => {
    const onWidthChange = vi.fn()
    setup({ width: 400, onWidthChange })
    const sep = screen.getByRole('separator')
    fireEvent.pointerDown(sep, { clientX: 600, pointerId: 1 })
    fireEvent.pointerMove(sep, { clientX: 550, pointerId: 1 })
    expect(onWidthChange).toHaveBeenLastCalledWith(450)
    fireEvent.pointerMove(sep, { clientX: 0, pointerId: 1 })
    expect(onWidthChange).toHaveBeenLastCalledWith(720)
    fireEvent.pointerUp(sep, { pointerId: 1 })
    onWidthChange.mockClear()
    fireEvent.pointerMove(sep, { clientX: 500, pointerId: 1 })
    expect(onWidthChange).not.toHaveBeenCalled()
  })

  it('renders docked as expanded on a phone', () => {
    window.innerWidth = 400
    setup({ summary: <div>summary-strip</div> })
    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByText('summary-strip')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close chat' })).toBeInTheDocument()
  })

  it('uses a custom test id prefix', () => {
    setup({ 'data-testid': 'c' })
    expect(screen.getByTestId('c')).toBeInTheDocument()
    expect(screen.getByTestId('c-input')).toBeInTheDocument()
  })
})
