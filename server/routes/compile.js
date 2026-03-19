const express = require('express')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const router = express.Router()

router.post('/', (req, res) => {
  console.log('\n[GCC] ==========================================')
  console.log('[GCC] Received new local GCC compilation request')

  const { code, stdin } = req.body

  console.log('[GCC] --- INCOMING PAYLOAD ---')
  console.log('[GCC] CODE LENGTH:', code ? code.length : 0, 'characters')
  console.log('[GCC] STDIN:', stdin ? `"${stdin}"` : '<none>')
  console.log('[GCC] ------------------------')

  if (!code || !code.trim()) {
    console.log('[GCC] ERROR: No code provided. Aborting request.')
    return res.status(400).json({ error: 'No code provided' })
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compile-'))
  const srcFile = path.join(tmpDir, 'main.c')
  const outFile = path.join(tmpDir, 'main.exe')
  const stdinFile = path.join(tmpDir, 'stdin.txt')

  console.log('[GCC] Created temporary directory:', tmpDir)
  console.log('[GCC] Source file path:', srcFile)
  console.log('[GCC] Output executable path:', outFile)

  const cleanup = () => {
    console.log('[GCC] Cleaning up temporary directory:', tmpDir)
    try { fs.rmSync(tmpDir, { recursive: true }) } catch (err) {
      console.log('[GCC] Cleanup error:', err.message)
    }
  }

  try {
    fs.writeFileSync(srcFile, code)
    fs.writeFileSync(stdinFile, stdin || '')
    console.log('[GCC] Wrote code to main.c and stdin to stdin.txt')

    const compileCmd = `gcc "${srcFile}" -o "${outFile}" -lm`
    console.log('[GCC] Executing compilation command:', compileCmd)

    exec(compileCmd, (compileErr, _, compileStderr) => {
      console.log('[GCC] Compilation finished.')
      
      if (compileErr) {
        console.log('[GCC] Compilation Error Encountered!')
        console.log('[GCC] Error Output:', compileStderr)
        cleanup()
        console.log('[GCC] ==========================================\n')
        return res.json({ error: compileStderr })
      }

      console.log('[GCC] Compilation successful. Output file created.')

      const runCmd = `"${outFile}" < "${stdinFile}"`
      console.log('[GCC] Executing compiled program:', runCmd)

      exec(
        runCmd,
        { timeout: 5000, shell: 'cmd.exe' },
        (runErr, stdout, stderr) => {
          console.log('[GCC] Program execution finished.')
          
          console.log('[GCC] --- RAW EXECUTION RESULTS ---')
          console.log(`[GCC] stdout: ${stdout ? 'YES (length: ' + stdout.length + ')' : 'NO'}`)
          console.log(`[GCC] stderr: ${stderr ? 'YES (length: ' + stderr.length + ')' : 'NO'}`)
          if (runErr) console.log('[GCC] runErr:', runErr.message)
          console.log('[GCC] -----------------------------')

          cleanup()
          if (runErr && !stdout) {
            console.log('[GCC] ERROR: Runtime error encountered without stdout.')
            console.log('[GCC] ==========================================\n')
            return res.json({ error: stderr || 'Runtime error' })
          }
          
          console.log('[GCC] SUCCESS: Returning execution stdout/stderr to frontend.')
          console.log('[GCC] ==========================================\n')
          return res.json({ output: stdout, stderr })
        }
      )
    })
  } catch (err) {
    console.error('[GCC] CRITICAL EXECUTION ERROR:', err.message)
    cleanup()
    console.log('[GCC] ==========================================\n')
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
