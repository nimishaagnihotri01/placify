import express from 'express'
import {
  approveGmailOpportunity,
  disconnectGmail,
  getGmailAuthUrl,
  getGmailOpportunities,
  getGmailStatus,
  handleGmailOAuthCallback,
  ignoreGmailOpportunity,
  syncGmail,
} from '../controllers/gmailController.js'

const router = express.Router()

router.get('/status', getGmailStatus)
router.get('/auth-url', getGmailAuthUrl)
router.get('/oauth/callback', handleGmailOAuthCallback)
router.post('/disconnect', disconnectGmail)
router.post('/sync', syncGmail)
router.get('/opportunities', getGmailOpportunities)
router.post('/opportunities/:id/approve', approveGmailOpportunity)
router.post('/opportunities/:id/ignore', ignoreGmailOpportunity)

export default router
