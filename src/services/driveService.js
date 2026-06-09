import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'

const driveApi = axios.create({
  baseURL: `${API_BASE_URL}/api/drives`,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong while connecting to Placify API'
  )
}

export async function getDrives() {
  try {
    const response = await driveApi.get('/')
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getDriveById(id) {
  try {
    const response = await driveApi.get(`/${id}`)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createDrive(data) {
  try {
    const response = await driveApi.post('/', data)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateDrive(id, data) {
  try {
    const response = await driveApi.put(`/${id}`, data)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteDrive(id) {
  try {
    const response = await driveApi.delete(`/${id}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
