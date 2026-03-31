import express from 'express'
import axios from 'axios'
import { boomiHeaders } from '../middleware/auth.js'

const router = express.Router()
const BOOMI_BASE = 'https://api.boomi.com/embedkit/v1/integrations'

function handleBoomiError(err, res) {
  const status = err.response?.status || 500
  const message =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    'Internal server error'
  console.error(`[Boomi] ${status}: ${message}`)
  res.status(status).json({ error: true, status, message })
}

// GET /api/integrations — list all integrations
router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(BOOMI_BASE, { headers: boomiHeaders() })
    res.json(data)
  } catch (err) {
    handleBoomiError(err, res)
  }
})

// POST /api/integrations — create a new integration
router.post('/', async (req, res) => {
  try {
    const { data } = await axios.post(BOOMI_BASE, req.body, { headers: boomiHeaders() })
    res.status(201).json(data)
  } catch (err) {
    handleBoomiError(err, res)
  }
})

// GET /api/integrations/:id — fetch a single integration
router.get('/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${BOOMI_BASE}/${req.params.id}`, { headers: boomiHeaders() })
    res.json(data)
  } catch (err) {
    handleBoomiError(err, res)
  }
})

// PUT /api/integrations/:id — update an integration
router.put('/:id', async (req, res) => {
  try {
    const { data } = await axios.put(`${BOOMI_BASE}/${req.params.id}`, req.body, {
      headers: boomiHeaders(),
    })
    res.json(data)
  } catch (err) {
    handleBoomiError(err, res)
  }
})

// DELETE /api/integrations/:id — remove an integration
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${BOOMI_BASE}/${req.params.id}`, { headers: boomiHeaders() })
    res.status(204).send()
  } catch (err) {
    handleBoomiError(err, res)
  }
})

export default router
