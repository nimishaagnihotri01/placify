import PlacementDrive from '../models/PlacementDrive.js'

const DRIVE_FIELDS = [
  'companyName',
  'role',
  'registrationDeadline',
  'testDate',
  'interviewDate',
  'eligibilityCriteria',
  'packageCtc',
  'notes',
  'status',
]

function getDrivePayload(body) {
  return DRIVE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) {
      if (body[field] === '' && ['testDate', 'interviewDate'].includes(field)) {
        payload[field] = null
      } else {
        payload[field] = body[field] === '' ? undefined : body[field]
      }
    }

    return payload
  }, {})
}

export async function createDrive(req, res, next) {
  try {
    const drive = await PlacementDrive.create(getDrivePayload(req.body))
    res.status(201).json({
      success: true,
      data: drive,
    })
  } catch (error) {
    next(error)
  }
}

export async function getDrives(req, res, next) {
  try {
    const drives = await PlacementDrive.find().sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives,
    })
  } catch (error) {
    next(error)
  }
}

export async function getDriveById(req, res, next) {
  try {
    const drive = await PlacementDrive.findById(req.params.id)

    if (!drive) {
      res.status(404)
      throw new Error('Placement drive not found')
    }

    res.status(200).json({
      success: true,
      data: drive,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateDrive(req, res, next) {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      getDrivePayload(req.body),
      {
        new: true,
        runValidators: true,
      },
    )

    if (!drive) {
      res.status(404)
      throw new Error('Placement drive not found')
    }

    res.status(200).json({
      success: true,
      data: drive,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteDrive(req, res, next) {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.id)

    if (!drive) {
      res.status(404)
      throw new Error('Placement drive not found')
    }

    res.status(200).json({
      success: true,
      message: 'Placement drive deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
