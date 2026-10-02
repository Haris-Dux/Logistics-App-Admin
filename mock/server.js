/**
 * Mock REST API for local development (replaced by the real backend later).
 *
 * - Serves every `data/<resource>.json` file as `/api/<resource>` via json-server.
 * - Moves the whole dataset forward so its anchor day becomes today.
 * - Adds `POST /api/auth/login` and serves signatures/photos from `public/`.
 */
import jsonServer from 'json-server'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.MOCK_PORT ?? 4000)
const ANCHOR_DATE = '2026-10-01' // the day the dataset describes as "today"
const DATE = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
const SECRET_FIELDS = ['password']

const root = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(root, 'data')

// Depots run on UK time, like the portal
const today = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Europe/London',
})
const offsetMs = Date.parse(today) - Date.parse(ANCHOR_DATE)

function shiftDates(value) {
  if (Array.isArray(value)) return value.map(shiftDates)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shiftDates(item)])
    )
  }
  if (
    typeof value === 'string' &&
    (DATE.test(value) || DATE_TIME.test(value))
  ) {
    const shifted = new Date(Date.parse(value) + offsetMs).toISOString()
    return DATE.test(value) ? shifted.slice(0, 10) : shifted
  }
  return value
}

function withoutSecrets(value) {
  if (Array.isArray(value)) return value.map(withoutSecrets)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => !SECRET_FIELDS.includes(key))
    )
  }
  return value
}

const db = Object.fromEntries(
  fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => [
      path.basename(file, '.json'),
      shiftDates(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))),
    ])
)

const server = jsonServer.create()
const router = jsonServer.router(db)

router.render = (_req, res) => {
  res.jsonp(withoutSecrets(res.locals.data))
}

server.use(
  '/api',
  jsonServer.defaults({ static: path.join(root, 'public') }),
  jsonServer.bodyParser
)

server.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const admin = router.db
    .get('admins')
    .find({ username, password, active: true })
    .value()

  if (!admin) {
    res.status(401).json({ title: 'Invalid username or password.' })
    return
  }

  res.json({ token: `mock-token-${admin.id}`, user: withoutSecrets(admin) })
})

// Fields a real backend sets itself when a record is created
const CREATE_DEFAULTS = {
  admins: () => ({ active: true, lastLoginAt: null }),
  drivers: () => ({
    active: true,
    deviceId: null,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  }),
  messages: () => ({
    direction: 'outbound',
    quickReply: false,
    sentAt: new Date().toISOString(),
    deliveredAt: null,
    readAt: null,
  }),
}

server.post('/api/:resource', (req, _res, next) => {
  const defaults = CREATE_DEFAULTS[req.params.resource]
  if (defaults) req.body = { ...defaults(), ...req.body }
  next()
})

server.use('/api', router)

server.listen(PORT, () => {
  console.log(
    `Mock API ready on http://localhost:${PORT}/api (data dated ${today})`
  )
})
