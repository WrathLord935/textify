import { useState } from 'react'

const TABS = ['Appearance', 'Layout & Sizing', 'Visibility', 'Page Margins', 'Watermark']

const NumberInput = ({ value, onChange, min, max, step = 1, suffix = '' }) => {
  const numValue = parseFloat(value) || 0

  const handleIncrement = () => {
    const next = Number((numValue + parseFloat(step)).toFixed(2))
    onChange(max !== undefined ? Math.min(max, next) : next)
  }
  const handleDecrement = () => {
    const next = Number((numValue - parseFloat(step)).toFixed(2))
    onChange(min !== undefined ? Math.max(min, next) : next)
  }

  return (
    <div className="flex items-center bg-[#1a1d27] border border-[#2d3148] rounded-lg overflow-hidden focus-within:border-[#e11d48] transition-colors w-32">
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-slate-300 text-sm p-2 outline-none pl-3 text-center font-mono"
      />
      {suffix && <span className="text-slate-500 text-sm font-mono pr-2">{suffix}</span>}
      <div className="flex flex-col border-l border-[#2d3148] w-7 flex-shrink-0">
        <button 
          onClick={handleIncrement}
          className="h-[18px] flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-[#2d3148] transition-colors border-b border-[#2d3148]"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
        </button>
        <button 
          onClick={handleDecrement}
          className="h-[18px] flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-[#2d3148] transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  )
}

const SettingsModal = ({ onClose, watermark, setWatermark, settings, setSettings }) => {
  const [activeTab, setActiveTab] = useState('Appearance')

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      setWatermark(prev => ({
        ...prev,
        base64: evt.target.result,
        filename: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#13151f] border border-[#2d3148] rounded-2xl w-full max-w-4xl max-h-[90vh] md:h-[600px] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT SIDEBAR TABS */}
        <div className="w-full md:w-56 bg-[#0f1117] border-b md:border-b-0 md:border-r border-[#1e2130] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-[#1e2130] hidden md:block flex-shrink-0">
            <h2 className="text-slate-200 font-semibold tracking-wide">Document Settings</h2>
          </div>
          <div className="flex-1 flex flex-row md:flex-col overflow-x-auto bg-[#0f1117]">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 text-center md:text-left px-5 py-3 md:py-2.5 text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-b-2 md:border-b-0 md:border-l-2 border-[#e11d48] md:bg-[#e11d48]/10 text-[#e11d48] font-medium' 
                    : 'border-b-2 md:border-b-0 md:border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1d27]/50 md:hover:bg-[#1a1d27]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 flex flex-col relative bg-[#13151f] min-h-0">
          {/* Close Header */}
          <div className="flex justify-between items-center p-5 border-b border-[#1e2130]">
            <h3 className="text-lg font-semibold text-slate-200">{activeTab}</h3>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-[#e11d48] transition-colors p-1"
              title="Close Settings (Esc)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Active Tab Body */}
          <div className="p-6 overflow-y-auto flex-1">
            
            {activeTab === 'Appearance' && (
              <div className="flex flex-col gap-4 max-w-2xl">
                <p className="text-sm text-slate-400 mb-4">Customize the exact hex colors used for the generated LaTeX syntax highlighting.</p>
                
                {[
                    { label: 'Keywords (int, void)', key: 'keywordColor', def: '#00b4c8' },
                    { label: 'Strings ("Hello")', key: 'stringColor', def: '#e05c8a' },
                    { label: 'Comments (// note)', key: 'commentColor', def: '#00b450' },
                    { label: 'Line Numbers', key: 'lineNumberColor', def: '#a0afc3' },
                    { label: 'Operators (+, -, <, >)', key: 'operatorColor', def: '#ff8c00' },
                    { label: 'Specifiers/Escapes (%d, \\n)', key: 'specifierColor', def: '#b400c8' },
                    { label: 'Functions (main, printf)', key: 'functionColor', def: '#e6db74' },
                    { label: 'Numbers (0-9)', key: 'numberColor', def: '#ae81ff' },
                    { label: 'Directives (#include)', key: 'directiveColor', def: '#f92672' },
                    { label: 'System Headers (<stdio.h>)', key: 'headerColor', def: '#fd971f' },
                  ].map(({ label, key, def }) => (
                    <div key={key} className="flex items-center justify-between pb-4 border-b border-[#1e2130]">
                      <div>
                        <h4 className="text-slate-200 font-medium text-sm">{label}</h4>
                        <div className="text-xs text-slate-500 font-mono mt-1">{settings.appearance[key] || def}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateSettings('appearance', key, def)}
                          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
                        >
                          Reset
                        </button>
                        <input 
                          type="color" 
                          value={settings.appearance[key] || def}
                          onChange={(e) => updateSettings('appearance', key, e.target.value)}
                          className="w-10 h-10 p-1 bg-[#1a1d27] border border-[#2d3148] rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'Layout & Sizing' && (
              <div className="flex flex-col gap-8 max-w-2xl">
                <p className="text-sm text-slate-400">Configure global typographic sizing and PDF geometry logic.</p>
                
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-slate-300 font-medium">Global Font Size</label>
                  <NumberInput 
                    value={parseInt(settings.layout.fontSize) || 12}
                    onChange={(val) => updateSettings('layout', 'fontSize', val)}
                    min={8} max={24} step={1} suffix="pt"
                  />
                  <p className="text-xs text-slate-500">The root font size applied to the entire article document.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-slate-300 font-medium">Vertical Spacing Between Programs</label>
                  <NumberInput 
                    value={settings.layout.programSpacing}
                    onChange={(val) => updateSettings('layout', 'programSpacing', val)}
                    min={0} max={100} step={1} suffix="pt"
                  />
                  <p className="text-xs text-slate-500">Only applies if programs are configured to print on the same page.</p>
                </div>
              </div>
            )}

            {activeTab === 'Visibility' && (
              <div className="flex flex-col gap-6 max-w-2xl">
                <p className="text-sm text-slate-400 mb-2">Select exactly which logical blocks of the data model are rendered out to the final LaTeX PDF.</p>
                
                {[
                  { label: 'Show Student Detail Header', desc: 'Renders the Name/Sem/Reg block at the top of programs.', key: 'showStudentInfo' },
                  { label: 'Show Program Title', desc: 'Renders the "Program 1: Title" header.', key: 'showProgramTitle' },
                  { label: 'Render Source Code', desc: 'Outputs the actual C syntax blocks.', key: 'showCode' },
                  { label: 'Render Terminal Output', desc: 'Outputs the resulting terminal string blocks.', key: 'showOutput' },
                ].map(({ label, desc, key }) => (
                  <div key={key} className="flex items-start justify-between pb-4 border-b border-[#1e2130]">
                    <div className="pr-4">
                      <h4 className="text-slate-200 font-medium mb-1">{label}</h4>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.visibility[key]}
                        onChange={(e) => updateSettings('visibility', key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-[#1a1d27] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48] border border-[#2d3148]"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Page Margins' && (
              <div className="flex flex-col gap-8 max-w-2xl">
                <p className="text-sm text-slate-400">Control the physical margins of the A4 document boundaries.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { label: 'Top Margin', key: 'top' },
                    { label: 'Bottom Margin', key: 'bottom' },
                    { label: 'Left Margin', key: 'left' },
                    { label: 'Right Margin', key: 'right' },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm text-slate-300 font-medium">{label}</label>
                      <NumberInput 
                        value={settings.margins[key]}
                        onChange={(val) => updateSettings('margins', key, val)}
                        min={0} max={10} step={0.1} suffix="cm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Watermark' && (
              <div className="flex flex-col gap-8 max-w-2xl">
                
                {/* 1. ENABLE TOGGLE */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1e2130]">
                  <div>
                    <h4 className="text-slate-200 font-medium mb-1">Enable Background Watermark</h4>
                    <p className="text-xs text-slate-500">Injects a centered image behind your code pages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={watermark.enabled}
                      onChange={(e) => setWatermark(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-[#1a1d27] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48] border border-[#2d3148]"></div>
                  </label>
                </div>

                {watermark.enabled && (
                  <>
                    {/* 2. UPLOAD & PREVIEW */}
                    <div className="flex gap-6 items-start">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-sm text-slate-300 font-medium">Upload Image (PNG/JPG)</label>
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleWatermarkUpload}
                          className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1a1d27] file:text-slate-300 file:cursor-pointer hover:file:bg-[#2d3148] hover:file:text-white transition-colors border border-[#2d3148] rounded-lg p-1 w-full"
                        />
                        {watermark.filename && (
                          <p className="text-xs text-[#e11d48] mt-1">✓ Active: {watermark.filename}</p>
                        )}
                      </div>
                      
                      {/* PREVIEW BOX */}
                      <div className="w-40 h-52 bg-white rounded-lg border-2 border-[#2d3148] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                        {watermark.base64 ? (
                          <img 
                            src={watermark.base64} 
                            alt="preview" 
                            className="w-full h-full object-contain absolute"
                            style={{ 
                              opacity: watermark.opacity,
                              transform: `translate(${watermark.marginX}px, ${-watermark.marginY}px)` // invert Y for standard visual intuition 
                            }} 
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-[10px] text-center text-white backdrop-blur-sm">
                          Live PDF Preview
                        </div>
                      </div>
                    </div>

                    {/* 3. OPACITY CONTROLS */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-300 font-medium">Image Opacity</label>
                        <span className="text-xs bg-[#1a1d27] text-[#e11d48] px-2 py-1 rounded font-mono">
                          {Math.round(watermark.opacity * 100)}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0.05" max="1" step="0.05" 
                        value={watermark.opacity}
                        onChange={(e) => setWatermark(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        className="w-full accent-[#e11d48] cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-500">Lower values ensure the watermark stays subtle behind your code.</p>
                    </div>

                    {/* 4. MARGINS / POSITIONING */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-300 font-medium">Horizontal Offset</label>
                          <span className="text-xs bg-[#1a1d27] text-slate-400 px-2 py-1 rounded font-mono">
                            {watermark.marginX}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setWatermark(prev => ({...prev, marginX: prev.marginX - 10}))} className="px-2 py-1 bg-[#1a1d27] hover:bg-[#2d3148] rounded text-slate-300 transition-colors">-</button>
                          <input 
                            type="range" 
                            min="-200" max="200" step="5" 
                            value={watermark.marginX}
                            onChange={(e) => setWatermark(prev => ({ ...prev, marginX: parseInt(e.target.value) }))}
                            className="flex-1 accent-[#e11d48] cursor-pointer"
                          />
                          <button onClick={() => setWatermark(prev => ({...prev, marginX: prev.marginX + 10}))} className="px-2 py-1 bg-[#1a1d27] hover:bg-[#2d3148] rounded text-slate-300 transition-colors">+</button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-300 font-medium">Vertical Offset</label>
                          <span className="text-xs bg-[#1a1d27] text-slate-400 px-2 py-1 rounded font-mono">
                            {watermark.marginY}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setWatermark(prev => ({...prev, marginY: prev.marginY - 10}))} className="px-2 py-1 bg-[#1a1d27] hover:bg-[#2d3148] rounded text-slate-300 transition-colors">-</button>
                          <input 
                            type="range" 
                            min="-200" max="200" step="5" 
                            value={watermark.marginY}
                            onChange={(e) => setWatermark(prev => ({ ...prev, marginY: parseInt(e.target.value) }))}
                            className="flex-1 accent-[#e11d48] cursor-pointer"
                          />
                          <button onClick={() => setWatermark(prev => ({...prev, marginY: prev.marginY + 10}))} className="px-2 py-1 bg-[#1a1d27] hover:bg-[#2d3148] rounded text-slate-300 transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
        </div>
        
      </div>
    </div>
  )
}

export default SettingsModal
