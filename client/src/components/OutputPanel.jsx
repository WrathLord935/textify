import { useState } from 'react'
import JSZip from 'jszip'

const OutputPanel = ({ latex, onGenerate, hasWatermark, watermarkBase64, watermarkFilename }) => {

  const [copied, setCopied] = useState(false)

  // ── COPY ───────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(latex)
    setCopied(true)
    // reset "Copied!" back to "Copy" after 2 seconds
    setTimeout(() => setCopied(false), 2000)
  }

  // ── DOWNLOAD .tex ──────────────────────────────────────
  const handleDownloadTex = () => {
    // Blob is a file-like object the browser can create in memory
    const blob = new Blob([latex], { type: 'text/plain' })
    // createObjectURL turns the blob into a temporary URL
    const url = URL.createObjectURL(blob)
    // create an invisible <a> tag, set its href to the blob URL, click it
    const a = document.createElement('a')
    a.href = url
    a.download = 'programs.tex'
    a.click()
    // clean up — revoke the temporary URL to free memory
    URL.revokeObjectURL(url)
  }

  // ── DOWNLOAD .zip (watermark enabled) ─────────────────
  const handleDownloadZip = async () => {
    const zip = new JSZip()

    // add the .tex file as a text entry
    zip.file('programs.tex', latex)

    // watermarkBase64 is a full data URL: "data:image/png;base64,ABC123..."
    // split at the comma — everything after is the raw base64 data
    if (watermarkBase64) {
      const base64Data = watermarkBase64.split(',')[1]
      zip.file(watermarkFilename, base64Data, { base64: true })
    }

    // generateAsync builds the zip — async because it can take a moment
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'programs.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">

      {/* TOP BAR */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e2130]">

        {/* GENERATE */}
        <button
          onClick={onGenerate}
          className="bg-[#e11d48] hover:bg-[#f43f5e] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Generate
        </button>

        {/* COPY — only rendered if latex has been generated */}
        {latex && (
          <button
            onClick={handleCopy}
            className="bg-[#1a1d27] hover:bg-[#2d3148] text-slate-300 text-xs px-4 py-1.5 rounded-lg transition-colors border border-[#2d3148]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}

        {/* DOWNLOAD — .zip if watermark is on, .tex otherwise */}
        {latex && (
          <button
            onClick={hasWatermark ? handleDownloadZip : handleDownloadTex}
            className="bg-[#1a1d27] hover:bg-[#2d3148] text-slate-300 text-xs px-4 py-1.5 rounded-lg transition-colors border border-[#2d3148]"
          >
            {hasWatermark ? 'Download .zip' : 'Download .tex'}
          </button>
        )}

        {/* small note when zip mode is active */}
        {latex && hasWatermark && (
          <span className="ml-auto text-xs text-slate-500 italic">
            Includes watermark image
          </span>
        )}

      </div>

      {/* OUTPUT AREA */}
      <div className="flex-1 overflow-auto p-5">
        {latex ? (
          // <pre> preserves all whitespace and newlines exactly as-is
          <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
            {latex}
          </pre>
        ) : (
          // empty state shown before first generate
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600 select-none">
            <span className="text-4xl">⌨</span>
            <p className="text-sm text-center">
              Fill in your details and programs,<br />then click Generate
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default OutputPanel
