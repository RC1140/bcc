import type { FormulaFile } from '@beads-ide/shared'
import { type CSSProperties, useCallback, useMemo, useState } from 'react'
import { useFormulas } from '../../hooks/use-formulas'

// --- Types ---

interface FormulaGroup {
  searchPath: string
  label: string
  formulas: FormulaFile[]
}

// --- Styles ---

const containerStyle: CSSProperties = {
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
}

const groupHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '22px',
  fontSize: '11px',
  color: '#888888',
  textTransform: 'uppercase',
  cursor: 'pointer',
  userSelect: 'none',
  padding: '0 8px',
  gap: '4px',
}

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '22px',
  fontSize: '13px',
  color: '#cccccc',
  cursor: 'pointer',
  userSelect: 'none',
  paddingLeft: '24px',
  paddingRight: '8px',
  gap: '4px',
  whiteSpace: 'nowrap',
}

const itemHoverBg = '#2a2d2e'
const itemActiveBg = '#094771'

const nameStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const skeletonContainerStyle: CSSProperties = {
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const skeletonRowStyle: CSSProperties = {
  height: '14px',
  borderRadius: '3px',
  backgroundColor: '#2a2d2e',
  animation: 'pulse 1.5s ease-in-out infinite',
}

const emptyStateStyle: CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  color: '#888',
  fontSize: '12px',
  lineHeight: 1.8,
}

const errorStyle: CSSProperties = {
  padding: '20px 16px',
  textAlign: 'center',
  color: '#f87171',
  fontSize: '12px',
}

const retryBtnStyle: CSSProperties = {
  marginTop: '8px',
  padding: '4px 12px',
  borderRadius: '4px',
  border: '1px solid #f87171',
  backgroundColor: 'transparent',
  color: '#f87171',
  fontSize: '12px',
  cursor: 'pointer',
}

const searchPathHintStyle: CSSProperties = {
  marginTop: '12px',
  padding: '8px 12px',
  backgroundColor: '#2a2d2e',
  borderRadius: '4px',
  textAlign: 'left',
  fontSize: '11px',
  color: '#666',
  lineHeight: 1.6,
}

const codeStyle: CSSProperties = {
  backgroundColor: '#1e1e1e',
  padding: '1px 4px',
  borderRadius: '2px',
  fontSize: '11px',
}

// --- Icons ---

function FolderIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="#e2a52e"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M1.5 2A1.5 1.5 0 000 3.5V5h16v-.5A1.5 1.5 0 0014.5 3H7.71l-1.5-1.2A1.5 1.5 0 005.26 2H1.5zM0 6v6.5A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5V6H0z" />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#e2a52e"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M1.5 2A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5V5a1.5 1.5 0 00-1.5-1.5H7.71l-1.5-1.2A1.5 1.5 0 005.26 2H1.5z" />
    </svg>
  )
}

function FileCodeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#519aba"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M3 1.5A1.5 1.5 0 014.5 0h4.379a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0113.5 4.622V14.5a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 14.5v-13zM6.5 9L5 10.5 6.5 12l-.7.7L3.5 10.5l2.3-2.2.7.7zm3 0L11 10.5 9.5 12l.7.7 2.3-2.2-2.3-2.2-.7.7z" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#cccccc"
      aria-hidden="true"
      style={{
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.1s',
        flexShrink: 0,
      }}
    >
      <path
        d="M6 4l4 4-4 4"
        fill="none"
        stroke="#cccccc"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// --- Sub-components ---

function LoadingSkeleton() {
  return (
    <div style={skeletonContainerStyle}>
      <div style={{ ...skeletonRowStyle, width: '60%' }} />
      <div style={{ ...skeletonRowStyle, width: '80%' }} />
      <div style={{ ...skeletonRowStyle, width: '45%' }} />
      <div style={{ ...skeletonRowStyle, width: '70%' }} />
    </div>
  )
}

function EmptyState() {
  return (
    <div style={emptyStateStyle}>
      <p style={{ fontSize: '13px', color: '#cccccc', marginBottom: '8px' }}>
        Create your first formula
      </p>
      <p>
        Place a <code style={codeStyle}>.formula.toml</code> file in one of these search paths:
      </p>
      <div style={searchPathHintStyle}>
        <div>
          <code style={codeStyle}>formulas/</code>
        </div>
        <div>
          <code style={codeStyle}>.beads/formulas/</code>
        </div>
        <div>
          <code style={codeStyle}>~/.beads/formulas/</code>
        </div>
        <div>
          <code style={codeStyle}>$GT_ROOT/.beads/formulas/</code>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div style={errorStyle}>
      <p>{error.message}</p>
      <button type="button" style={retryBtnStyle} onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

// --- Main component ---

export function FormulaTree() {
  const { formulas, isLoading, error, refresh } = useFormulas()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Get current formula from URL
  const currentFormula = useMemo(() => {
    const match = window.location.pathname.match(/^\/formula\/(.+)$/)
    return match ? decodeURIComponent(match[1]) : null
  }, [])

  // Group formulas by search path, filtering out empty groups
  const groups = useMemo((): FormulaGroup[] => {
    const byPath = new Map<string, FormulaGroup>()

    for (const formula of formulas) {
      let group = byPath.get(formula.searchPath)
      if (!group) {
        group = {
          searchPath: formula.searchPath,
          label: formula.searchPathLabel,
          formulas: [],
        }
        byPath.set(formula.searchPath, group)
      }
      group.formulas.push(formula)
    }

    return Array.from(byPath.values())
  }, [formulas])

  const toggleGroup = useCallback((searchPath: string) => {
    setCollapsed((prev) => ({ ...prev, [searchPath]: !prev[searchPath] }))
  }, [])

  const navigateToFormula = useCallback((name: string) => {
    window.history.pushState({}, '', `/formula/${encodeURIComponent(name)}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={refresh} />
  if (formulas.length === 0) return <EmptyState />

  return (
    <nav style={containerStyle} role="tree" aria-label="Formula explorer">
      {groups.map((group) => {
        const isCollapsed = collapsed[group.searchPath] ?? false

        return (
          <fieldset key={group.searchPath} style={{ border: 'none', margin: 0, padding: 0 }}>
            <button
              type="button"
              aria-expanded={!isCollapsed}
              style={{ ...groupHeaderStyle, width: '100%', background: 'none', border: 'none' }}
              onClick={() => toggleGroup(group.searchPath)}
            >
              <ChevronIcon expanded={!isCollapsed} />
              <FolderIcon open={!isCollapsed} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#666' }}>
                {group.formulas.length}
              </span>
            </button>

            {!isCollapsed &&
              group.formulas.map((formula) => {
                const isActive = formula.name === currentFormula

                return (
                  <button
                    type="button"
                    key={formula.path}
                    aria-selected={isActive}
                    style={{
                      ...itemStyle,
                      backgroundColor: isActive ? itemActiveBg : 'transparent',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                    }}
                    onClick={() => navigateToFormula(formula.name)}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = itemHoverBg
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <FileCodeIcon />
                    <span style={nameStyle}>{formula.name}</span>
                  </button>
                )
              })}
          </fieldset>
        )
      })}
    </nav>
  )
}
