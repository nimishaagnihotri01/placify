import { google } from 'googleapis'
import GmailConnection from '../models/GmailConnection.js'
import GmailOpportunity from '../models/GmailOpportunity.js'
import PlacementDrive from '../models/PlacementDrive.js'
import { encrypt, decrypt, verifySignedState } from '../utils/crypto.js'
import {
  createOAuthClient,
  getClientRedirectUrl,
  getGoogleAuthUrl,
} from '../utils/googleOAuth.js'
import {
  getGmailSearchQuery,
  getMessageHeader,
  getMessageText,
  normalizeOpportunityKey,
} from '../utils/gmailMessages.js'
import { extractPlacementOpportunities } from '../../src/utils/placementEmailParser.js'

const REQUIRED_OPPORTUNITY_FIELDS = [
  'companyName',
  'role',
  'registrationDeadline',
]

function getFieldValue(field) {
  return field?.value || ''
}

function mapExtraction(extraction) {
  return {
    extracted: {
      companyName: getFieldValue(extraction.companyName),
      role: getFieldValue(extraction.role),
      registrationDeadline: getFieldValue(extraction.registrationDeadline),
      testDate: getFieldValue(extraction.testDate),
      interviewDate: getFieldValue(extraction.interviewDate),
      packageCtc: getFieldValue(extraction.packageCtc),
      eligibilityCriteria: getFieldValue(extraction.eligibilityCriteria),
      location: getFieldValue(extraction.location),
      notes: getFieldValue(extraction.notes),
    },
    confidence: {
      companyName: extraction.companyName?.confidence || 'Low',
      role: extraction.role?.confidence || 'Low',
      registrationDeadline: extraction.registrationDeadline?.confidence || 'Low',
      testDate: extraction.testDate?.confidence || 'Low',
      interviewDate: extraction.interviewDate?.confidence || 'Low',
      packageCtc: extraction.packageCtc?.confidence || 'Low',
      eligibilityCriteria: extraction.eligibilityCriteria?.confidence || 'Low',
      location: extraction.location?.confidence || 'Low',
      notes: extraction.notes?.confidence || 'Low',
    },
  }
}

function hasMinimumPlacementSignal(extracted) {
  return Boolean(
    extracted.companyName ||
      extracted.role ||
      extracted.registrationDeadline ||
      extracted.testDate ||
      extracted.interviewDate ||
      extracted.packageCtc,
  )
}

function toDrivePayload(extracted) {
  return {
    companyName: extracted.companyName?.trim(),
    role: extracted.role?.trim(),
    registrationDeadline: extracted.registrationDeadline || undefined,
    testDate: extracted.testDate || undefined,
    interviewDate: extracted.interviewDate || undefined,
    packageCtc: extracted.packageCtc || undefined,
    eligibilityCriteria: extracted.eligibilityCriteria || undefined,
    location: extracted.location || undefined,
    notes: extracted.notes || undefined,
    status: 'Applied',
  }
}

function validateDrivePayload(payload) {
  return REQUIRED_OPPORTUNITY_FIELDS.filter((field) => !payload[field])
}

function getDayRange(dateValue) {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

async function findDuplicateDrive(extracted) {
  const payload = toDrivePayload(extracted)
  const dateRange = getDayRange(payload.registrationDeadline)

  if (!payload.companyName || !payload.role || !dateRange) {
    return null
  }

  return PlacementDrive.findOne({
    companyName: new RegExp(`^${escapeRegex(payload.companyName)}$`, 'i'),
    role: new RegExp(`^${escapeRegex(payload.role)}$`, 'i'),
    registrationDeadline: {
      $gte: dateRange.start,
      $lte: dateRange.end,
    },
  })
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function getConnectionOrThrow() {
  const connection = await GmailConnection.findOne().sort({ updatedAt: -1 })

  if (!connection) {
    const error = new Error('Connect Gmail before syncing placement emails')
    error.statusCode = 400
    throw error
  }

  return connection
}

async function getAuthorizedOAuthClient(connection) {
  const oauthClient = createOAuthClient()

  oauthClient.setCredentials({
    access_token: decrypt(connection.encryptedAccessToken),
    refresh_token: decrypt(connection.encryptedRefreshToken),
    expiry_date: connection.tokenExpiryDate?.getTime(),
  })

  oauthClient.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      connection.encryptedAccessToken = encrypt(tokens.access_token)
    }

    if (tokens.refresh_token) {
      connection.encryptedRefreshToken = encrypt(tokens.refresh_token)
    }

    if (tokens.expiry_date) {
      connection.tokenExpiryDate = new Date(tokens.expiry_date)
    }

    await connection.save()
  })

  return oauthClient
}

export async function getGmailStatus(req, res, next) {
  try {
    const connection = await GmailConnection.findOne().sort({ updatedAt: -1 })
    const [pendingCount, duplicateCount] = await Promise.all([
      GmailOpportunity.countDocuments({ status: 'pending' }),
      GmailOpportunity.countDocuments({
        status: 'pending',
        duplicateDriveId: { $ne: null },
      }),
    ])

    res.status(200).json({
      success: true,
      data: {
        isConnected: Boolean(connection),
        email: connection?.email || '',
        lastSyncAt: connection?.lastSyncAt || null,
        lastSyncStatus: connection?.lastSyncStatus || 'Disconnected',
        lastSyncError: connection?.lastSyncError || '',
        placementEmailsFound: connection?.placementEmailsFound || 0,
        importedCount: connection?.importedCount || 0,
        ignoredCount: connection?.ignoredCount || 0,
        pendingCount,
        duplicateCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getGmailAuthUrl(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: {
        authUrl: getGoogleAuthUrl(),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function handleGmailOAuthCallback(req, res, next) {
  try {
    const { code, error, state } = req.query

    if (error) {
      res.redirect(getClientRedirectUrl(`/gmail-sync?gmail_error=${error}`))
      return
    }

    if (!code || !verifySignedState(state)) {
      res.redirect(getClientRedirectUrl('/gmail-sync?gmail_error=invalid_state'))
      return
    }

    const oauthClient = createOAuthClient()
    const { tokens } = await oauthClient.getToken(code)

    if (!tokens.refresh_token) {
      res.redirect(getClientRedirectUrl('/gmail-sync?gmail_error=no_refresh_token'))
      return
    }

    oauthClient.setCredentials(tokens)
    const oauth2 = google.oauth2({ auth: oauthClient, version: 'v2' })
    const profile = await oauth2.userinfo.get()

    const existingConnection = await GmailConnection.findOne().sort({
      updatedAt: -1,
    })
    const payload = {
      email: profile.data.email || '',
      googleUserId: profile.data.id || '',
      encryptedAccessToken: encrypt(tokens.access_token),
      encryptedRefreshToken: encrypt(tokens.refresh_token),
      tokenExpiryDate: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : undefined,
      scopes: tokens.scope?.split(' ') || [],
      lastSyncStatus: existingConnection?.lastSyncStatus || 'Never synced',
      lastSyncError: '',
    }

    if (existingConnection) {
      await GmailConnection.findByIdAndUpdate(existingConnection._id, payload)
    } else {
      await GmailConnection.create(payload)
    }

    res.redirect(getClientRedirectUrl('/gmail-sync?connected=true'))
  } catch (error) {
    next(error)
  }
}

export async function disconnectGmail(req, res, next) {
  try {
    await GmailConnection.deleteMany({})

    res.status(200).json({
      success: true,
      message: 'Gmail disconnected successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function syncGmail(req, res, next) {
  let connection

  try {
    connection = await getConnectionOrThrow()
    const oauthClient = await getAuthorizedOAuthClient(connection)
    const gmail = google.gmail({ auth: oauthClient, version: 'v1' })
    const query = getGmailSearchQuery()
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 30,
    })
    const messageRefs = listResponse.data.messages || []
    let opportunitiesDetected = 0

    for (const messageRef of messageRefs) {
      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: messageRef.id,
        format: 'full',
      })
      const message = messageResponse.data
      const subject = getMessageHeader(message, 'Subject')
      const from = getMessageHeader(message, 'From')
      const receivedAt = new Date(
        Number(message.internalDate) || getMessageHeader(message, 'Date'),
      )
      const messageText = getMessageText(message)
      const parseText = `Subject: ${subject}\nFrom: ${from}\n\n${messageText}`
      const extractedOpportunities = extractPlacementOpportunities(parseText)

      for (const [index, extraction] of extractedOpportunities.entries()) {
        const { extracted, confidence } = mapExtraction(extraction)

        if (!hasMinimumPlacementSignal(extracted)) {
          continue
        }

        opportunitiesDetected += 1

        const sourceKey = [
          message.id,
          index,
          normalizeOpportunityKey(extracted.companyName),
          normalizeOpportunityKey(extracted.role),
        ]
          .filter(Boolean)
          .join(':')
        const duplicateDrive = await findDuplicateDrive(extracted)
        const existingOpportunity = await GmailOpportunity.findOne({ sourceKey })
        const opportunityPayload = {
          gmailMessageId: message.id,
          threadId: message.threadId || '',
          subject,
          from,
          snippet: message.snippet || '',
          receivedAt: Number.isNaN(receivedAt.getTime()) ? undefined : receivedAt,
          rawText: parseText.slice(0, 16000),
          extracted,
          confidence,
          duplicateDriveId: duplicateDrive?._id || null,
        }

        if (existingOpportunity) {
          if (existingOpportunity.status === 'pending') {
            await GmailOpportunity.findByIdAndUpdate(
              existingOpportunity._id,
              opportunityPayload,
              { runValidators: true },
            )
          }
        } else {
          await GmailOpportunity.create({
            sourceKey,
            ...opportunityPayload,
          })
        }
      }
    }

    connection.lastSyncAt = new Date()
    connection.lastSyncStatus = 'Success'
    connection.lastSyncError = ''
    connection.placementEmailsFound = messageRefs.length
    await connection.save()

    const opportunities = await GmailOpportunity.find()
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: {
        placementEmailsFound: messageRefs.length,
        opportunitiesDetected,
        opportunities,
      },
    })
  } catch (error) {
    if (connection) {
      connection.lastSyncAt = new Date()
      connection.lastSyncStatus = 'Failed'
      connection.lastSyncError = error.message
      await connection.save().catch(() => {})
    }

    next(error)
  }
}

export async function getGmailOpportunities(req, res, next) {
  try {
    const status = req.query.status
    const filter = status ? { status } : {}
    const opportunities = await GmailOpportunity.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    })
  } catch (error) {
    next(error)
  }
}

export async function approveGmailOpportunity(req, res, next) {
  try {
    const opportunity = await GmailOpportunity.findById(req.params.id)

    if (!opportunity) {
      res.status(404)
      throw new Error('Gmail opportunity not found')
    }

    const existingExtracted =
      opportunity.extracted?.toObject?.() || opportunity.extracted || {}
    const extracted = {
      ...existingExtracted,
      ...(req.body.extracted || {}),
    }
    const payload = toDrivePayload(extracted)
    const missingFields = validateDrivePayload(payload)

    if (missingFields.length > 0) {
      res.status(400)
      throw new Error(
        `Missing required fields before import: ${missingFields.join(', ')}`,
      )
    }

    const duplicateDrive = await findDuplicateDrive(extracted)
    if (duplicateDrive) {
      opportunity.status = 'duplicate'
      opportunity.duplicateDriveId = duplicateDrive._id
      await opportunity.save()

      res.status(200).json({
        success: true,
        duplicate: true,
        message: 'Already tracked',
        data: {
          opportunity,
          drive: duplicateDrive,
        },
      })
      return
    }

    const drive = await PlacementDrive.create(payload)
    opportunity.extracted = extracted
    opportunity.status = 'imported'
    opportunity.createdDriveId = drive._id
    opportunity.importedAt = new Date()
    await opportunity.save()

    await GmailConnection.findOneAndUpdate(
      {},
      { $inc: { importedCount: 1 } },
      { sort: { updatedAt: -1 } },
    )

    res.status(201).json({
      success: true,
      duplicate: false,
      message: 'Placement drive imported successfully',
      data: {
        opportunity,
        drive,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function ignoreGmailOpportunity(req, res, next) {
  try {
    const opportunity = await GmailOpportunity.findByIdAndUpdate(
      req.params.id,
      {
        status: 'ignored',
        ignoredAt: new Date(),
      },
      { new: true },
    )

    if (!opportunity) {
      res.status(404)
      throw new Error('Gmail opportunity not found')
    }

    await GmailConnection.findOneAndUpdate(
      {},
      { $inc: { ignoredCount: 1 } },
      { sort: { updatedAt: -1 } },
    )

    res.status(200).json({
      success: true,
      message: 'Gmail opportunity ignored',
      data: opportunity,
    })
  } catch (error) {
    next(error)
  }
}
