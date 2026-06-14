import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'

const gmailApi = axios.create({
  baseURL: `${API_BASE_URL}/api/gmail`,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong while connecting to Gmail'
  )
}

export async function getGmailStatus() {
  try {
    const response = await gmailApi.get('/status')
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getGmailAuthUrl() {
  try {
    const response = await gmailApi.get('/auth-url')
    return response.data.data.authUrl
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function disconnectGmail() {
  try {
    const response = await gmailApi.post('/disconnect')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function syncGmail() {
  try {
    const response = await gmailApi.post('/sync')
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getGmailOpportunities(status = '') {
  try {
    const response = await gmailApi.get('/opportunities', {
      params: status ? { status } : {},
    })
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function approveGmailOpportunity(id, extracted) {
  try {
    const response = await gmailApi.post(`/opportunities/${id}/approve`, {
      extracted,
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function ignoreGmailOpportunity(id) {
  try {
    const response = await gmailApi.post(`/opportunities/${id}/ignore`)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
