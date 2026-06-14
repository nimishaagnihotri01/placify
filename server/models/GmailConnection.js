import mongoose from 'mongoose'

const gmailConnectionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      default: '',
    },
    googleUserId: {
      type: String,
      trim: true,
      default: '',
    },
    encryptedAccessToken: {
      type: String,
      default: '',
    },
    encryptedRefreshToken: {
      type: String,
      required: true,
    },
    tokenExpiryDate: {
      type: Date,
    },
    scopes: {
      type: [String],
      default: [],
    },
    lastSyncAt: {
      type: Date,
    },
    lastSyncStatus: {
      type: String,
      enum: ['Never synced', 'Success', 'Failed', 'Disconnected'],
      default: 'Never synced',
    },
    lastSyncError: {
      type: String,
      default: '',
    },
    placementEmailsFound: {
      type: Number,
      default: 0,
    },
    importedCount: {
      type: Number,
      default: 0,
    },
    ignoredCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const GmailConnection = mongoose.model('GmailConnection', gmailConnectionSchema)

export default GmailConnection
