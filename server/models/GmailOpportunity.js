import mongoose from 'mongoose'

const gmailOpportunitySchema = new mongoose.Schema(
  {
    sourceKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gmailMessageId: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    from: {
      type: String,
      default: '',
      trim: true,
    },
    snippet: {
      type: String,
      default: '',
      trim: true,
    },
    receivedAt: {
      type: Date,
    },
    rawText: {
      type: String,
      default: '',
    },
    extracted: {
      companyName: { type: String, default: '', trim: true },
      role: { type: String, default: '', trim: true },
      registrationDeadline: { type: String, default: '' },
      testDate: { type: String, default: '' },
      interviewDate: { type: String, default: '' },
      packageCtc: { type: String, default: '', trim: true },
      eligibilityCriteria: { type: String, default: '', trim: true },
      location: { type: String, default: '', trim: true },
      notes: { type: String, default: '', trim: true },
    },
    confidence: {
      companyName: { type: String, default: 'Low' },
      role: { type: String, default: 'Low' },
      registrationDeadline: { type: String, default: 'Low' },
      testDate: { type: String, default: 'Low' },
      interviewDate: { type: String, default: 'Low' },
      packageCtc: { type: String, default: 'Low' },
      eligibilityCriteria: { type: String, default: 'Low' },
      location: { type: String, default: 'Low' },
      notes: { type: String, default: 'Low' },
    },
    status: {
      type: String,
      enum: ['pending', 'imported', 'ignored', 'duplicate'],
      default: 'pending',
      index: true,
    },
    duplicateDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      default: null,
    },
    createdDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      default: null,
    },
    importedAt: {
      type: Date,
    },
    ignoredAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const GmailOpportunity = mongoose.model(
  'GmailOpportunity',
  gmailOpportunitySchema,
)

export default GmailOpportunity
