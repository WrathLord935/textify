import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COMPILER_ENABLED = import.meta.env.VITE_COMPILER_ENABLED === 'true'

// ── PURE CSS AUTO-RESIZE TEXTAREA ─────────────────────────
const AutoResizeTextarea = ({ value, onChange, placeholder, minRows = 3, className }) => {
  return (
    <div className="grid">
      <div className={`${className} invisible whitespace-pre-wrap col-start-1 row-start-1 break-words`}>
        {value + ' '}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={minRows}
        className={`${className} resize-none overflow-hidden col-start-1 row-start-1 w-full h-full m-0`}
      />
    </div>
  )
}

const ProgramContainer = ({ program, index, onChange, onDelete, onToggleCollapse }) => {

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: program.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handlePaste = async (field, currentValue) => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      if (currentValue.trim() !== '') {
        const confirmed = window.confirm(`Are you sure you want to overwrite the existing ${field}?`)
        if (!confirmed) return
      }
      onChange(program.id, field, text)
    } catch (err) {
      console.error('Failed to read clipboard', err)
      alert('Clipboard access denied or not supported by your browser.')
    }
  }

  const displayTitle = program.title || `Program ${index + 1}`

  // active tab — only relevant when compiler is enabled
  const activeTab = program.activeTab || 'paste'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-[#2d3148] rounded-lg bg-[#13151f] mb-3"
    >

      {/* ── TITLE BAR ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1d27] rounded-t-lg flex-shrink-0">

        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing px-1"
          title="Drag to reorder"
        >
          ⠿
        </button>

        <input
          type="text"
          value={program.title}
          onChange={(e) => onChange(program.id, 'title', e.target.value)}
          placeholder={displayTitle}
          className="flex-1 bg-transparent text-sm text-slate-300 outline-none placeholder-slate-500"
        />

        <button
          onClick={() => onToggleCollapse(program.id)}
          className="text-slate-500 hover:text-slate-300 text-xs px-1 transition-colors"
          title={program.collapsed ? 'Expand' : 'Collapse'}
        >
          {program.collapsed ? '▼' : '▲'}
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-slate-600 hover:text-red-400 text-xs px-1 transition-colors"
          title="Delete program"
        >
          ✕
        </button>
      </div>

      {/* ── DELETE CONFIRMATION ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-5 flex flex-col gap-4 shadow-2xl w-72">
            <p className="text-sm text-slate-300">
              Delete <span className="text-white font-semibold">{displayTitle}</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onDelete(program.id); setShowDeleteConfirm(false) }}
                className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm py-1.5 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[#2d3148] hover:bg-[#3d4268] text-slate-300 text-sm py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      {!program.collapsed && (
        <div className="flex flex-col gap-3 px-3 py-3">

          {/* CODE SECTION */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-500">Code</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePaste('code', program.code)}
                  className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors"
                >
                  Paste
                </button>
                <button
                  onClick={() => copyToClipboard(program.code)}
                  className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <AutoResizeTextarea
              value={program.code}
              onChange={(e) => onChange(program.id, 'code', e.target.value)}
              placeholder="Paste your C code here..."
              className="code-textarea"
              minRows={10}
            />
          </div>

          {/* TABS — only shown when compiler is enabled */}
          {COMPILER_ENABLED && (
            <div className="flex border-b border-[#2d3148]">
              <button
                onClick={() => onChange(program.id, 'activeTab', 'paste')}
                className={`text-xs px-4 py-1.5 transition-colors border-b-2 -mb-px ${activeTab === 'paste'
                    ? 'border-[#e11d48] text-[#e11d48]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
              >
                Paste
              </button>
              <button
                onClick={() => onChange(program.id, 'activeTab', 'run')}
                className={`text-xs px-4 py-1.5 transition-colors border-b-2 -mb-px ${activeTab === 'run'
                    ? 'border-[#e11d48] text-[#e11d48]'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
              >
                Run
              </button>
            </div>
          )}

          {/* OUTPUT SECTION — shown when compiler disabled OR paste tab active */}
          {(!COMPILER_ENABLED || activeTab === 'paste') && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500">Output</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePaste('output', program.output)}
                    className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors"
                  >
                    Paste
                  </button>
                  <button
                    onClick={() => copyToClipboard(program.output)}
                    className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <AutoResizeTextarea
                value={program.output}
                onChange={(e) => onChange(program.id, 'output', e.target.value)}
                placeholder="Paste your program output here..."
                className="code-textarea"
                minRows={5}
              />
            </div>
          )}

          {/* RUN TAB — only when compiler enabled and run tab active */}
          {COMPILER_ENABLED && activeTab === 'run' && (
            <RunTab program={program} onChange={onChange} />
          )}

        </div>
      )}
    </div>
  )
}

// ── RUN TAB ─────────────────────────────────────────────
const RunTab = ({ program, onChange }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')

  const handleRun = async () => {
    setIsRunning(true)
    setError('')
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: program.code,
          stdin: program.stdin,
        })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        onChange(program.id, 'runOutput', data.output)
      }
    } catch (err) {
      setError('Could not connect to the compile server. Is it running?')
    } finally {
      setIsRunning(false)
    }
  }

  // copies run output into the paste output box and switches tab
  const handleUseOutput = () => {
    onChange(program.id, 'output', program.runOutput)
    onChange(program.id, 'activeTab', 'paste')
  }

  return (
    <div className="flex flex-col gap-2 mt-2">

      {/* STDIN */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">
          Program Input (stdin) — one value per line
        </label>
        <textarea
          value={program.stdin || ''}
          onChange={(e) => onChange(program.id, 'stdin', e.target.value)}
          placeholder={'5\n1\n2\n3\n4\n5'}
          className="code-textarea"
          style={{ height: '80px', resize: 'vertical' }}
        />
      </div>

      {/* RUN BUTTON */}
      <button
        onClick={handleRun}
        disabled={isRunning || !program.code.trim()}
        className="self-start bg-[#e11d48]/20 hover:bg-[#e11d48]/40 text-[#e11d48] text-xs px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRunning ? 'Running...' : 'Run'}
      </button>

      {/* ERROR */}
      {error && (
        <p className="text-xs text-red-400 whitespace-pre-wrap">{error}</p>
      )}

      {/* RUN OUTPUT */}
      {program.runOutput && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-500">Output</label>
            <button
              onClick={handleUseOutput}
              className="text-xs text-[#e11d48] hover:text-[#fb7185] transition-colors"
            >
              Use this output →
            </button>
          </div>
          <pre className="code-textarea text-xs whitespace-pre-wrap" style={{ height: '120px', overflowY: 'auto' }}>
            {program.runOutput}
          </pre>
        </div>
      )}

    </div>
  )
}

export default ProgramContainer