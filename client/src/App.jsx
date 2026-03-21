import { useEffect, useRef, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import StudentInfo from './components/StudentInfo'
import ProgramList from './components/ProgramList'
import OutputPanel from './components/OutputPanel'
import SettingsModal from './components/SettingsModal'
import generateLatex from './utils/generateLatex'
import logo from './img/logo.png'
import loadingGif from './img/Simple-Dot-TeXify.gif'

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

const DEFAULT_DOC_SETTINGS = {
  appearance: {
    keywordColor: '#00b4c8',
    stringColor: '#e05c8a',
    commentColor: '#00b450',
    lineNumberColor: '#a0afc3',
    operatorColor: '#ff91ec',    // pinkish for operators
    specifierColor: '#b400c8',   // purple for %d, \n
    functionColor: '#e6db74',    // yellow for functions
    numberColor: '#ae81ff',      // purple/blue for numbers
    directiveColor: '#f92672',   // pink for #include
    headerColor: '#fd971f',      // orange-brown for <stdio.h>
  },
  layout: {
    fontSize: '12',
    programSpacing: '8', // in pt
  },
  visibility: {
    showStudentInfo: true,
    showProgramTitle: true,
    showCode: true,
    showOutput: true,
  },
  margins: {
    top: '2.2',
    bottom: '2.0',
    left: '2.5',
    right: '2.5',
  }
}

const App = () => {

  // ── LAUNCH SPLASH SCREEN ───────────────────────────────
  const [loadingState, setLoadingState] = useState('active') // 'active' | 'fading' | 'done'

  useEffect(() => {
    if (loadingState === 'done') return

    // Play GIF sequence for 3.5s to ensure the logo animation completes, then fade out smoothly
    const fadeTimer = setTimeout(() => {
      setLoadingState('fading')
    }, 3500)
    
    // Fully unmount exactly 500ms after the fade triggers
    const doneTimer = setTimeout(() => setLoadingState('done'), 4000)
    
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [loadingState])

  // ── STATE ──────────────────────────────────────────────

  const [fields, setFields] = useLocalStorage('studentFields', DEFAULT_FIELDS)
  const [programs, setPrograms] = useLocalStorage('programs', [createProgram()])
  const [watermark, setWatermark] = useLocalStorage('watermark', {
    enabled: false,
    base64: null,
    filename: '',
    opacity: 0.15,
    marginX: 0,
    marginY: 0,
  })
  
  // New unified document generation settings
  const [docSettings, setDocSettings] = useLocalStorage('docSettings', DEFAULT_DOC_SETTINGS)
  
  const [generatedLatex, setGeneratedLatex] = useLocalStorage('generatedLatex', '')

  // ── RESIZING LAYOUT ────────────────────────────────────

  const [leftWidth, setLeftWidth] = useLocalStorage('leftPanelWidth', 50) // percentage
  const [topHeight, setTopHeight] = useLocalStorage('studentInfoHeight', 320) // exact pixels

  const isDraggingVertical = useRef(false)
  const isDraggingHorizontal = useRef(false)

  // ── MOBILE LAYOUT STATE ────────────────────────────────
  const [mobileTab, setMobileTab] = useState('editor') // 'editor' | 'output'

  // ── MODAL STATES ───────────────────────────────────────
  
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetMenuOpen, setResetMenuOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: '',
  })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingVertical.current) {
        const newWidth = (e.clientX / window.innerWidth) * 100
        setLeftWidth(Math.min(Math.max(newWidth, 25), 75))
      } else if (isDraggingHorizontal.current) {
        const newHeight = e.clientY - 48 
        setTopHeight(Math.max(newHeight, 150))
      }
    }

    const handleMouseUp = () => {
      if (isDraggingVertical.current || isDraggingHorizontal.current) {
        isDraggingVertical.current = false
        isDraggingHorizontal.current = false
        document.body.style.cursor = 'default'
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setLeftWidth, setTopHeight])

  const startVerticalResize = (e) => {
    e.preventDefault()
    isDraggingVertical.current = true
    document.body.style.cursor = 'col-resize'
  }

  const startHorizontalResize = (e) => {
    e.preventDefault()
    isDraggingHorizontal.current = true
    document.body.style.cursor = 'row-resize'
  }

  // ── RELOAD WARNING ─────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ── PROGRAM HANDLERS ───────────────────────────────────

  const handleAddProgram = () => {
    setPrograms(prev => [...prev, createProgram()])
  }

  const handleDeleteProgram = (id) => {
    setPrograms(prev => prev.filter(p => p.id !== id))
  }

  const handleProgramChange = (id, field, value) => {
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
      watermark.opacity,
      watermark.marginX,
      watermark.marginY,
      docSettings
    )
    setGeneratedLatex(latex)
  }

  // ── RESET EXECUTION ────────────────────────────────────

  const executeReset = () => {
    switch (confirmModal.type) {
      case 'all':
        setFields(DEFAULT_FIELDS)
        setPrograms([createProgram()])
        setWatermark({ enabled: false, base64: null, filename: '', opacity: 0.15, marginX: 0, marginY: 0 })
        setDocSettings(DEFAULT_DOC_SETTINGS)
        setGeneratedLatex('')
        setLeftWidth(50)
        setTopHeight(320)
        break
      case 'info':
        setFields(DEFAULT_FIELDS)
        setWatermark({ enabled: false, base64: null, filename: '', opacity: 0.15, marginX: 0, marginY: 0 })
        break
      case 'programs':
        setPrograms([createProgram()])
        break
      case 'tex':
        setGeneratedLatex('')
        break
      case 'layout':
        setLeftWidth(50)
        setTopHeight(320)
        break
    }
    setConfirmModal({ isOpen: false, type: null, title: '' })
  }

  // ── RENDER ─────────────────────────────────────────────

  return (
    <>
      {/* ── SPLASH SCREEN OVERLAY ── */}
      {loadingState !== 'done' && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#18181B] transition-opacity duration-500 ease-in-out pointer-events-none ${loadingState === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
          <img 
            src={loadingGif} 
            alt="Loading TeXify..." 
            className="w-full h-full max-w-2xl object-contain p-4 md:p-0"
          />
        </div>
      )}

      {/* DOCUMENT SETTINGS MODAL */}
      {settingsOpen && (
        <SettingsModal 
          onClose={() => setSettingsOpen(false)}
          watermark={watermark}
          setWatermark={setWatermark}
          settings={docSettings}
          setSettings={setDocSettings}
        />
      )}

      {/* GLOBAL CONFIRM MODAL OVERLAY */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#13151f] border border-[#2d3148] rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-slate-100 text-lg font-semibold border-b border-[#1e2130] pb-3">Reset Confirmation</h3>
            <p className="text-slate-400 text-sm">
              Are you sure you want to completely <strong className="text-red-400">{confirmModal.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: null, title: '' })}
                className="flex-1 bg-[#1a1d27] hover:bg-[#2d3148] text-slate-300 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeReset}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[100dvh] bg-[#0f1117] text-slate-200 overflow-hidden relative pb-14 md:pb-0">

        {/* LEFT PANEL */}
        <div 
          style={{ '--md-width': `${leftWidth}%` }} 
          className={`w-full md:w-[var(--md-width)] flex-col flex-shrink-0 h-full ${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex`}
        >

          {/* title bar — fixed, never scrolls */}
          <div className="px-5 py-3 border-b border-[#1e2130] flex items-center justify-between flex-shrink-0 relative">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="TeXify Logo" className="w-6 h-6 object-contain" />
              <span className="text-base font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">TeXify</span>
            </div>

            {/* HEADER CONTROLS */}
            <div className="flex items-center gap-2">
              
              {/* SETTINGS BUTTON */}
              <button 
                onClick={() => setSettingsOpen(true)}
                className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-[#13151f] border border-[#1e2130] hover:border-[#e11d48]"
                title="Document Settings"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </button>

              {/* RESET MENU DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => setResetMenuOpen(!resetMenuOpen)}
                  className="text-xs text-slate-500 hover:text-[#e11d48] transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-[#13151f] border border-[#1e2130] hover:border-[#e11d48]"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reset
                </button>
                
                {resetMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setResetMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#13151f] border border-[#2d3148] rounded-xl shadow-2xl py-1.5 z-40 overflow-hidden flex flex-col">
                      <button onClick={() => { setResetMenuOpen(false); setConfirmModal({ isOpen: true, type: 'info', title: 'Reset Student Info' }) }} className="text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27] transition-colors">Reset Student Info</button>
                      <button onClick={() => { setResetMenuOpen(false); setConfirmModal({ isOpen: true, type: 'programs', title: 'Reset All Programs' }) }} className="text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27] transition-colors">Reset Programs</button>
                      <button onClick={() => { setResetMenuOpen(false); setConfirmModal({ isOpen: true, type: 'tex', title: 'Clear Generated TeX' }) }} className="text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27] transition-colors">Reset Generated TeX</button>
                      <button onClick={() => { setResetMenuOpen(false); setConfirmModal({ isOpen: true, type: 'layout', title: 'Reset Layout Sizes' }) }} className="text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27] transition-colors">Reset Layout</button>
                      <div className="my-1 border-t border-[#1e2130]"></div>
                      <button onClick={() => { setResetMenuOpen(false); setConfirmModal({ isOpen: true, type: 'all', title: 'Factory Reset Everything' }) }} className="text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 font-medium transition-colors">Reset Everything</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic split layout area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Half: StudentInfo (Dynamic Height) */}
            <div style={{ height: `${topHeight}px` }} className="flex-shrink-0 overflow-hidden bg-[#0f1117]">
              <StudentInfo
                fields={fields}
                onFieldsChange={setFields}
              />
            </div>

            {/* HORIZONTAL RESIZER */}
            <div 
              onMouseDown={startHorizontalResize}
              className="h-1.5 cursor-row-resize bg-[#1e2130] hover:bg-[#e11d48] active:bg-[#e11d48] z-10 flex-shrink-0 transition-colors"
            />

            {/* Bottom Half: ProgramList (Takes remaining left-panel space) */}
            <div className="flex-1 overflow-y-auto">
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
        </div>

        {/* VERTICAL RESIZER BETWEEN LEFT & RIGHT */}
        <div 
          onMouseDown={startVerticalResize}
          className="hidden md:block w-1.5 cursor-col-resize bg-[#1e2130] hover:bg-[#e11d48] active:bg-[#e11d48] z-10 flex-shrink-0 transition-colors"
        />

        {/* RIGHT PANEL (Takes remaining window space) */}
        <div className={`flex-1 flex-col min-w-0 h-full ${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex`}>
          <OutputPanel
            latex={generatedLatex}
            onGenerate={handleGenerate}
            hasWatermark={watermark.enabled && !!watermark.base64}
            watermarkBase64={watermark.base64}
            watermarkFilename={watermark.filename}
          />
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <div className="md:hidden absolute bottom-0 inset-x-0 h-14 bg-[#13151f] border-t border-[#1e2130] flex z-50">
          <button 
            onClick={() => setMobileTab('editor')}
            className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${mobileTab === 'editor' ? 'text-[#e11d48] border-t-2 border-[#e11d48] bg-[#1a1d27]/50' : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Editor
          </button>
          <div className="w-[1px] bg-[#1e2130] my-2" />
          <button 
            onClick={() => setMobileTab('output')}
            className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${mobileTab === 'output' ? 'text-[#e11d48] border-t-2 border-[#e11d48] bg-[#1a1d27]/50' : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF Output
          </button>
        </div>

      </div>
    </>
  )
}

export default App