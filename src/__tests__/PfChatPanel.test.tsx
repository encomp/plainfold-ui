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

  it('does not send on Enter while composing text', () => {
    const { p } = setup({ draft: 'hi' })
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', isComposing: true })
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('does not send on the Safari composition-confirm Enter (keyCode 229)', () => {
    const { p } = setup({ draft: 'hi' })
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', keyCode: 229 })
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('caps the docked width at 60% of the row so the page keeps room', () => {
    setup({ mode: 'docked', width: 720 })
    expect(screen.getByRole('complementary').style.maxWidth).toBe('60%')
  })

  it('names the options menu', () => {
    setup({ menuItems: [{ id: 'new', label: 'New', onSelect: () => {} }] })
    fireEvent.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menu', { name: 'Chat options' })).toBeTruthy()
  })

  it('links only web and site-relative sources', () => {
    setup({
      messages: [
        {
          id: 's',
          role: 'assistant',
          text: 't',
          sources: [
            { label: 'Web', href: 'https://example.com' },
            { label: 'Local', href: '/jobs/1' },
            { label: 'Script', href: 'javascript:alert(1)' },
            { label: 'Data', href: 'data:text/html,x' },
            { label: 'Proto', href: '//evil.example' },
            { label: 'Back', href: '/\\evil.example' },
            { label: 'Tab', href: '/\t/evil.example' },
          ],
        },
      ],
    })
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(['Web', 'Local'])
    expect(screen.getByText('Script')).toBeInTheDocument()
  })

  it('reopens at the newest message with the menu shut', () => {
    const msgs: PfChatMessage[] = [{ id: 'a', role: 'user', text: 'x' }]
    const items = [{ id: 'x', label: 'X', onSelect: vi.fn() }]
    const { p, rerender } = setup({ messages: msgs, menuItems: items })
    const log = screen.getByRole('log')
    Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 1000 })
    Object.defineProperty(log, 'clientHeight', { configurable: true, value: 100 })
    log.scrollTop = 0
    fireEvent.scroll(log)
    fireEvent.click(screen.getByTestId('pf-chat-menu'))
    rerender(<PfChatPanel {...p} mode="hidden" />)
    rerender(<PfChatPanel {...p} mode="docked" />)
    expect(screen.queryByRole('menu')).toBeNull()
    const again = screen.getByRole('log')
    Object.defineProperty(again, 'scrollHeight', { configurable: true, value: 1000 })
    rerender(
      <PfChatPanel
        {...p}
        mode="docked"
        messages={[...msgs, { id: 'b', role: 'user', text: 'y' }]}
      />,
    )
    expect(again.scrollTop).toBe(1000)
  })

  it('prevents the page from scrolling on resize keys', () => {
    setup({ onWidthChange: vi.fn() })
    expect(fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' })).toBe(false)
  })

  it('does not show a resize handle without onWidthChange', () => {
    setup()
    expect(screen.queryByRole('separator')).toBeNull()
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

  it('returns focus to the menu button after a selection', () => {
    setup({ menuItems: [{ id: 'x', label: 'X', onSelect: vi.fn() }] })
    fireEvent.click(screen.getByTestId('pf-chat-menu'))
    fireEvent.click(screen.getByTestId('pf-chat-menu-x'))
    expect(screen.getByTestId('pf-chat-menu')).toHaveFocus()
  })

  it('moves through menu items with the arrow keys and closes on Tab', () => {
    setup({
      menuItems: [
        { id: 'a', label: 'A', onSelect: vi.fn() },
        { id: 'b', label: 'B', onSelect: vi.fn() },
      ],
    })
    fireEvent.click(screen.getByTestId('pf-chat-menu'))
    const a = screen.getByTestId('pf-chat-menu-a')
    const b = screen.getByTestId('pf-chat-menu-b')
    expect(a).toHaveFocus()
    fireEvent.keyDown(a, { key: 'ArrowDown' })
    expect(b).toHaveFocus()
    fireEvent.keyDown(b, { key: 'ArrowDown' })
    expect(a).toHaveFocus()
    fireEvent.keyDown(a, { key: 'ArrowUp' })
    expect(b).toHaveFocus()
    fireEvent.keyDown(b, { key: 'Home' })
    expect(a).toHaveFocus()
    fireEvent.keyDown(a, { key: 'Tab' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('follows new text only while the reader is near the bottom', () => {
    const one: PfChatMessage[] = [{ id: 'a', role: 'assistant', text: 'x', pending: true }]
    const { p, rerender } = setup({ messages: one })
    const log = screen.getByRole('log')
    Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 1000 })
    Object.defineProperty(log, 'clientHeight', { configurable: true, value: 100 })
    log.scrollTop = 0
    fireEvent.scroll(log) // reader scrolled up
    rerender(<PfChatPanel {...p} messages={[{ ...one[0], text: 'xy' }]} />)
    expect(log.scrollTop).toBe(0)
    expect(log).toHaveAttribute('aria-busy', 'true')
    const next: PfChatMessage[] = [
      { ...one[0], text: 'xy', pending: false },
      { id: 'b', role: 'user', text: 'q' },
    ]
    rerender(<PfChatPanel {...p} messages={next} />)
    expect(log.scrollTop).toBe(1000)
    expect(log).not.toHaveAttribute('aria-busy')
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

  describe('steps, question and stop-at-limit', () => {
    it('renders messages without the new props exactly as before', () => {
      setup({ messages })
      expect(screen.getByTestId('pf-chat-messages').innerHTML).toMatchSnapshot()
    })

    const steps = [
      { id: 's1', label: 'Looked up data', state: 'done' as const },
      { id: 's2', label: 'Reading page', state: 'running' as const },
    ]

    it('shows steps live while pending, with a spinner on the running one', () => {
      setup({ messages: [{ id: 'a', role: 'assistant', text: '', pending: true, steps }] })
      const live = screen.getByRole('status', { name: 'Steps' })
      expect(within(live).getByText('Looked up data')).toBeInTheDocument()
      expect(within(live).getByText('Reading page')).toBeInTheDocument()
      expect(within(live).getByText('Reading page').closest('li')).toHaveTextContent('◌')
    })

    it('folds finished steps into a closed details once not pending', () => {
      const done = steps.map((s) => ({ ...s, state: 'done' as const }))
      const { container } = setup({
        messages: [{ id: 'a', role: 'assistant', text: 'Answer', steps: done }],
      })
      const details = container.querySelector('details') as HTMLDetailsElement
      expect(details).not.toBeNull()
      expect(details.open).toBe(false)
      expect(within(details).getByText('2 steps')).toBeInTheDocument()
      expect(within(screen.getByRole('status', { name: 'Steps' })).getByText('2 steps')).toBeInTheDocument()
    })

    it('keeps a failed step visible after the reply ends', () => {
      const failed = [
        { id: 's1', label: 'Looked up data', state: 'done' as const },
        { id: 's2', label: 'Search failed', state: 'error' as const },
      ]
      const { container } = setup({
        messages: [{ id: 'a', role: 'assistant', text: 'Partial', steps: failed }],
      })
      expect(container.querySelector('details')).toBeNull()
      expect(screen.getByText('Search failed')).toBeVisible()
      expect(screen.getByText('Search failed').closest('li')).toHaveTextContent('Error')
    })

    it('replaces the Sources heading with sourcesLabel', () => {
      setup({
        messages: [
          { id: 'a', role: 'assistant', text: 'x', sources: [{ label: 'One' }], sourcesLabel: 'Looked at' },
        ],
      })
      expect(screen.getByText(/Looked at:/)).toBeInTheDocument()
      expect(screen.queryByText(/Sources:/)).toBeNull()
    })

    it('calls onChoose once with the choice id, then disables the buttons', () => {
      const onChoose = vi.fn()
      setup({
        messages: [
          {
            id: 'a',
            role: 'assistant',
            text: '',
            question: {
              text: 'Which area?',
              choices: [
                { id: 'city', label: 'City' },
                { id: 'county', label: 'County' },
              ],
              onChoose,
            },
          },
        ],
      })
      expect(screen.getByText('Which area?')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'County' }))
      fireEvent.click(screen.getByRole('button', { name: 'City' }))
      fireEvent.click(screen.getByRole('button', { name: 'County' }))
      expect(onChoose).toHaveBeenCalledTimes(1)
      expect(onChoose).toHaveBeenCalledWith('county')
      expect(screen.getByRole('button', { name: 'City' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'County' })).toBeDisabled()
    })

    it('renders a question without choices as text only', () => {
      const { container } = setup({
        messages: [{ id: 'a', role: 'assistant', text: '', question: { text: 'Which area?' } }],
      })
      expect(screen.getByText('Which area?')).toBeInTheDocument()
      expect(container.querySelectorAll('button[data-choice]')).toHaveLength(0)
    })

    it('shows the stop message and Continue calls onContinue', () => {
      const onContinue = vi.fn()
      setup({
        messages: [
          { id: 'a', role: 'assistant', text: 'So far', stopped: { message: 'Stopped at limit', onContinue } },
        ],
      })
      expect(screen.getByText('Stopped at limit')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('chat-panel-continue'))
      expect(onContinue).toHaveBeenCalledTimes(1)
    })

    it('orders focus choices then Continue (DOM order) and groups the question', () => {
      setup({
        messages: [
          {
            id: 'a',
            role: 'assistant',
            text: '',
            question: { text: 'Which?', choices: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }], onChoose: vi.fn() },
            stopped: { message: 'Stopped', onContinue: vi.fn() },
          },
        ],
      })
      expect(screen.getByRole('group', { name: 'Which?' })).toBeInTheDocument()
      const order = Array.from(
        screen.getByTestId('pf-chat-messages').querySelectorAll<HTMLElement>('button'),
      ).map((b) => b.textContent)
      expect(order).toEqual(['X', 'Y', 'Continue'])
    })

    it('keeps one status wrapper from live to folded', () => {
      const msg = (pending: boolean, state: 'running' | 'done'): PfChatMessage => ({
        id: 'a',
        role: 'assistant',
        text: '',
        pending,
        steps: [{ id: 's1', label: 'Step', state }],
      })
      const { p, rerender } = setup({ messages: [msg(true, 'running')] })
      const el = screen.getByRole('status', { name: 'Steps' })
      rerender(<PfChatPanel {...p} messages={[msg(false, 'done')]} />)
      expect(screen.getByRole('status', { name: 'Steps' })).toBe(el)
    })

    it('resets the chosen state when the question is replaced', () => {
      const q = (text: string): PfChatMessage => ({
        id: 'a',
        role: 'assistant',
        text: '',
        question: { text, choices: [{ id: 'x', label: text + ' X' }], onChoose: vi.fn() },
      })
      const { p, rerender } = setup({ messages: [q('First')] })
      fireEvent.click(screen.getByRole('button', { name: 'First X' }))
      expect(screen.getByRole('button', { name: 'First X' })).toBeDisabled()
      rerender(<PfChatPanel {...p} messages={[q('Second')]} />)
      expect(screen.getByRole('button', { name: 'Second X' })).toBeEnabled()
    })
  })
})

describe('PfChatPanel cost meter and slash menu', () => {
  const items = [
    { id: 'a', name: 'size-up', description: 'Size up a niche', whoLabel: 'everyone' },
    { id: 'b', name: 'pitch-check', description: 'Check a pitch', whoLabel: 'you' },
    { id: 'c', name: 'summarise', description: 'Shorten', whoLabel: 'everyone' },
  ]

  it('renders the meter with values and text', () => {
    setup({ costMeter: { spentUsd: 0.07, ceilingUsd: 0.25 } })
    const m = screen.getByRole('meter')
    expect(m).toHaveAttribute('aria-valuenow', '0.07')
    expect(m).toHaveAttribute('aria-valuemin', '0')
    expect(m).toHaveAttribute('aria-valuemax', '0.25')
    expect(m).toHaveTextContent('$0.07 of $0.25')
  })

  const fill = () => screen.getByTestId('chat-panel-cost-meter-fill')

  it('uses warning at 80% and danger at 100%, clamping overspend', () => {
    const { rerender, p } = setup({ costMeter: { spentUsd: 0.05, ceilingUsd: 0.25 } })
    expect(fill().style.background).toContain('--pf-accent')
    rerender(<PfChatPanel {...p} costMeter={{ spentUsd: 0.2, ceilingUsd: 0.25 }} />)
    expect(fill().style.background).toContain('--pf-warning')
    rerender(<PfChatPanel {...p} costMeter={{ spentUsd: 0.3, ceilingUsd: 0.25 }} />)
    expect(fill().style.background).toContain('--pf-danger')
    expect(fill().style.width).toBe('100%')
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0.25')
  })

  it('opens on / and filters on /su', () => {
    const { rerender, p } = setup({ slashItems: items, draft: '/' })
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByText('for you')).toBeInTheDocument()
    rerender(<PfChatPanel {...p} slashItems={items} draft="/su" />)
    expect(screen.getAllByRole('option')).toHaveLength(1)
    rerender(<PfChatPanel {...p} slashItems={items} draft="/size-up x" />)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('never opens without or with empty slashItems', () => {
    const { rerender, p } = setup({ draft: '/' })
    expect(screen.queryByRole('listbox')).toBeNull()
    rerender(<PfChatPanel {...p} slashItems={[]} draft="/" />)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('keeps the textarea a plain textarea (no combobox) and labels the listbox', () => {
    setup({ slashItems: items, draft: '/' })
    const input = screen.getByLabelText('Message')
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(input).not.toHaveAttribute('role')
    expect(input).not.toHaveAttribute('aria-expanded')
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeInTheDocument()
  })

  it('announces the highlighted option in a polite live region', () => {
    setup({ slashItems: items, draft: '/' })
    const live = screen.getByTestId('pf-chat-slash-live')
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(live).toHaveTextContent('/size-up, Size up a niche, 1 of 3')
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'ArrowDown' })
    expect(live).toHaveTextContent('/pitch-check, Check a pitch, 2 of 3')
  })

  it('uses the higher-contrast secondary colour for the slash item description line', () => {
    setup({ slashItems: items, draft: '/' })
    expect(screen.getByText('for you').style.color).toBe('var(--pf-text-secondary)')
  })

  it('leaves the live region empty when the menu is closed', () => {
    setup({ slashItems: items, draft: 'hello' })
    expect(screen.getByTestId('pf-chat-slash-live')).toBeEmptyDOMElement()
  })

  it('moves with arrows and Enter inserts and calls onSlashSelect', () => {
    const onSlashSelect = vi.fn()
    const { p } = setup({ slashItems: items, draft: '/', onSlashSelect })
    const input = screen.getByLabelText('Message')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(p.onDraftChange).toHaveBeenCalledWith('/summarise ')
    expect(onSlashSelect).toHaveBeenCalledWith(items[2])
    expect(p.onSend).not.toHaveBeenCalled()
  })

  it('Escape closes the menu and stays shut until the draft changes, then reopens', () => {
    const { rerender, p } = setup({ slashItems: items, draft: '/p' })
    const input = screen.getByLabelText('Message')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.change(input, { target: { value: '/pi' } })
    rerender(<PfChatPanel {...p} slashItems={items} draft="/pi" />)
    fireEvent.change(input, { target: { value: '/p' } })
    rerender(<PfChatPanel {...p} slashItems={items} draft="/p" />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('ignores slash keys while an IME composition is active', () => {
    const { p } = setup({ slashItems: items, draft: '/' })
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', keyCode: 229 })
    expect(p.onDraftChange).not.toHaveBeenCalled()
  })

  it('a NaN or negative ceiling never shows NaN and reads as full', () => {
    setup({ costMeter: { spentUsd: Number.NaN, ceilingUsd: Number.NaN } })
    const m = screen.getByRole('meter')
    expect(m.outerHTML).not.toContain('NaN')
    expect(m).toHaveTextContent('$0.00 of $0.00')
    expect(screen.getByTestId('chat-panel-cost-meter-fill').style.background).toContain('--pf-danger')
  })

  it('click on an option inserts it', () => {
    const onSlashSelect = vi.fn()
    const { p } = setup({ slashItems: items, draft: '/', onSlashSelect })
    fireEvent.click(screen.getAllByRole('option')[1])
    expect(p.onDraftChange).toHaveBeenCalledWith('/pitch-check ')
    expect(onSlashSelect).toHaveBeenCalledWith(items[1])
  })

  it('small lines (meta, sources) use the secondary colour, never muted', () => {
    setup({
      messages: [
        { id: 'a', role: 'assistant', text: 'x', meta: 'Stopped at the limit', sources: [{ label: 'Src' }] },
      ],
    })
    expect(screen.getByText('Stopped at the limit').style.color).toBe('var(--pf-text-secondary)')
    expect(screen.getByText(/Sources/).style.color).toBe('var(--pf-text-secondary)')
  })
})
