import express from 'express'
import axios from 'axios'
import { boomiHeaders } from '../middleware/auth.js'

const router = express.Router()

// GET /api/environments
// Fetches the environments available in the Boomi account
router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.boomi.com/embedkit/v1/environment', {
      headers: boomiHeaders(),
    })
    res.json(data)
  } catch (err) {
    const status = err.response?.status || 500
    const message =
      err.response?.data?.message || err.message || 'Failed to fetch environments'
    console.error(`[Boomi] environments ${status}: ${message}`)
    res.status(status).json({ error: true, status, message })
  }
})

export default router
