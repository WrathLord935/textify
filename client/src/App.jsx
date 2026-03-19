import { useEffect } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import StudentInfo from './components/StudentInfo'
import ProgramList from './components/ProgramList'
import OutputPanel from './components/OutputPanel'
import generateLatex from './utils/generateLatex'

// default 3 fields shown on first load
const DEFAULT_FIELDS = [
  { id: 1, label: 'Name', value: '', showLabel: false },
  { id: 2, label: 'Semester & Dept', value: '', showLabel: false },
  { id: 3, label: 'Reg No', value: '', showLabel: true },
]

const createProgram = () => ({
  id: Date.now(),
  title: '',
  code: '',
  output: '',
  collapsed: false,
  activeTab: 'paste',
  stdin: '',
  runOutput: '',
})

const App = () => {

  // ── STATE ──────────────────────────────────────────────

  // fields replaces studentInfo — dynamic list of { id, label, value, showLabel }
  const [fields, setFields] = useLocalStorage('studentFields', DEFAULT_FIELDS)

  const [programs, setPrograms] = useLocalStorage('programs', [
    createProgram()
  ])

  const [watermark, setWatermark] = useLocalStorage('watermark', {
    enabled: false,
    base64: null,
    filename: '',
  })

  const [generatedLatex, setGeneratedLatex] = useLocalStorage('generatedLatex', '')

  // ── RELOAD WARNING ─────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ── WATERMARK HANDLERS ─────────────────────────────────

  const handleWatermarkToggle = (enabled) => {
    setWatermark(prev => ({ ...prev, enabled }))
  }

  const handleWatermarkUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setWatermark(prev => ({
        ...prev,
        base64: e.target.result,
        filename: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  // ── PROGRAM HANDLERS ───────────────────────────────────

  const handleAddProgram = () => {
    setPrograms(prev => [...prev, createProgram()])
  }

  const handleDeleteProgram = (id) => {
    setPrograms(prev => prev.filter(p => p.id !== id))
  }

  const handleProgramChange = (id, field, value) => {
    // strip leading empty lines when code changes
    if (field === 'code') {
      const lines = value.split('\n')
      while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift()
      }
      setPrograms(prev =>
        prev.map(p => p.id === id ? { ...p, code: lines.join('\n') } : p)
      )
      return
    }
    setPrograms(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    )
  }

  const handleToggleCollapse = (id) => {
    setPrograms(prev =>
      prev.map(p => p.id === id ? { ...p, collapsed: !p.collapsed } : p)
    )
  }

  const handleReorder = (newOrder) => {
    setPrograms(newOrder)
  }

  // ── GENERATE ───────────────────────────────────────────

  const handleGenerate = () => {
    const latex = generateLatex(
      fields,
      programs,
      watermark.enabled ? watermark.base64 : null,
      watermark.filename,
    )
    setGeneratedLatex(latex)
  }

  // ── RENDER ─────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#0f1117] text-slate-200 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-1/2 flex flex-col border-r border-[#1e2130]">

        {/* title bar — fixed, never scrolls */}
        <div className="px-5 py-3 border-b border-[#1e2130] flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#e11d48]" />
          <span className="text-sm font-semibold tracking-wide text-slate-300">TeXify</span>
        </div>

        {/* scrollable area */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          <StudentInfo
            fields={fields}
            onFieldsChange={setFields}
            watermark={watermark}
            onWatermarkToggle={handleWatermarkToggle}
            onWatermarkUpload={handleWatermarkUpload}
          />

          <div className="mx-5 border-t border-[#1e2130]" />

          <ProgramList
            programs={programs}
            onAdd={handleAddProgram}
            onDelete={handleDeleteProgram}
            onChange={handleProgramChange}
            onToggleCollapse={handleToggleCollapse}
            onReorder={handleReorder}
          />

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col">
        <OutputPanel
          latex={generatedLatex}
          onGenerate={handleGenerate}
          hasWatermark={watermark.enabled && !!watermark.base64}
          watermarkBase64={watermark.base64}
          watermarkFilename={watermark.filename}
        />
      </div>

    </div>
  )
}

export default App