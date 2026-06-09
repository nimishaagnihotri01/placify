import express from 'express'
import {
  createDrive,
  deleteDrive,
  getDriveById,
  getDrives,
  updateDrive,
} from '../controllers/driveController.js'

const router = express.Router()

router.route('/').get(getDrives).post(createDrive)
router.route('/:id').get(getDriveById).put(updateDrive).delete(deleteDrive)

export default router
