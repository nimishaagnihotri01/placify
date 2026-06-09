import mongoose from 'mongoose'

export const PLACEMENT_STATUSES = [
  'Applied',
  'OA Scheduled',
  'OA Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
  'Rejected',
]

const placementDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  testDate: {
    type: Date,
  },
  interviewDate: {
    type: Date,
  },
  eligibilityCriteria: {
    type: String,
    trim: true,
    default: '',
  },
  packageCtc: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: {
      values: PLACEMENT_STATUSES,
      message: 'Status must be a valid placement pipeline stage',
    },
    default: 'Applied',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema)

export default PlacementDrive
