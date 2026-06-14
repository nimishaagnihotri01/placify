import { google } from 'googleapis'
import { createSignedState } from './crypto.js'

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

function getRedirectUri() {
  return (
    process.env.GMAIL_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 5000}/api/gmail/oauth/callback`
  )
}

export function createOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required')
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    getRedirectUri(),
  )
}

export function getGoogleAuthUrl() {
  const oauthClient = createOAuthClient()

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    include_granted_scopes: true,
    prompt: 'consent',
    scope: GMAIL_SCOPES,
    state: createSignedState({ source: 'placify-gmail' }),
  })
}

export function getClientRedirectUrl(path = '/gmail-sync') {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  return `${baseUrl}${path}`
}
