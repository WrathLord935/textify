const express = require('express')
const cors = require('cors')
const compileRoute = require('./routes/compile')

const app = express()
const PORT = 3001

// ── MIDDLEWARE ────────────────────────────────────────────

// cors — allows the React frontend (on port 5173) to call this server
// without the browser blocking it as a cross-origin request
app.use(cors({
  origin: 'http://localhost:5173'
}))

// express.json() — parses incoming request bodies as JSON
// without this, req.body would be undefined
app.use(express.json())

// ── ROUTES ────────────────────────────────────────────────

// any request to /api/compile gets handled by compileRoute
app.use('/api/compile', compileRoute)

// ── START ─────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
