import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Edit3,
  FileCheck,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import StatusBadge from '../components/dashboard/StatusBadge.jsx'
import { DRIVE_STATUSES } from '../constants/driveStatus.js'
import { getDriveById, updateDrive } from '../services/driveService.js'
import { formatDate } from '../utils/dateFormatting.js'
import { buildDriveReminders } from '../utils/reminders.js'

const quickActions = [
  { status: 'OA Completed', label: 'Mark OA Completed', icon: FileCheck },
  {
    status: 'Interview Completed',
    label: 'Mark Interview Completed',
    icon: CheckCircle2,
  },
  { status: 'Selected', label: 'Mark Selected', icon: Trophy },
  { status: 'Rejected', label: 'Mark Rejected', icon: XCircle },
]

const detailItems = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'role', label: 'Role' },
  { key: 'registrationDeadline', label: 'Registration Deadline', isDate: true },
  { key: 'testDate', label: 'Test Date', isDate: true },
  { key: 'interviewDate', label: 'Interview Date', isDate: true },
  { key: 'packageCtc', label: 'Package/CTC' },
  { key: 'location', label: 'Location' },
]

export default function DriveDetails() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState('')
  const [error, setError] = useState('')
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDrive() {
      try {
        setIsLoading(true)
        setError('')
        const data = await getDriveById(id)

        if (isMounted) {
          setDrive(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDrive()

    return () => {
      isMounted = false
    }
  }, [id])

  const reminders = useMemo(() => {
    if (!drive) {
      return []
    }

    return buildDriveReminders([drive])
  }, [drive])

  async function updateStatus(status) {
    if (!drive || drive.status === status) {
      return
    }

    try {
      setIsUpdatingStatus(status)
      setStatusError('')
      const updatedDrive = await updateDrive(id, { status })
      setDrive(updatedDrive)
    } catch (updateError) {
      setStatusError(updateError.message)
    } finally {
      setIsUpdatingStatus('')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Drive Details"
        title={drive?.companyName || 'Placement drive'}
        description="Review the full placement application timeline, reminder state, and current progress."
        action={
          <div className="flex flex-wrap gap-3">
            <Button as="link" to="/dashboard" variant="secondary">
              <ArrowLeft size={18} aria-hidden="true" />
              Dashboard
            </Button>
            {drive && (
              <Button as="link" to={`/drives/${id}/edit`}>
                <Edit3 size={18} aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      {isLoading && (
        <LoadingState rows={4} title="Loading placement drive" />
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-8 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && drive && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-normal text-slate-950">
                  Application Summary
                </h2>
                <p className="mt-1 text-sm text-slate-500">{drive.role}</p>
              </div>
              <StatusBadge status={drive.status} />
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {detailItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-950">
                    {item.isDate
                      ? formatDate(drive[item.key])
                      : drive[item.key] || 'Not added'}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                    Status Timeline
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Current progress through the placement workflow.
                  </p>
                </div>
                <StatusBadge status={drive.status} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {DRIVE_STATUSES.map((status, index) => {
                  const currentIndex = DRIVE_STATUSES.indexOf(drive.status)
                  const isCurrent = status === drive.status
                  const isComplete =
                    currentIndex >= 0 &&
                    index < currentIndex &&
                    drive.status !== 'Rejected'

                  return (
                    <div
                      key={status}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                        isCurrent
                          ? 'border-indigo-200 bg-white text-indigo-800 shadow-sm'
                          : isComplete
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : isComplete
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold">{status}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                Eligibility Criteria
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {drive.eligibilityCriteria || 'No eligibility criteria added yet.'}
              </p>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                Notes
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {drive.notes || 'No notes added yet.'}
              </p>
            </div>
          </Card>

          <aside className="space-y-6">
            <Card className="p-5">
              <h2 className="text-lg font-bold tracking-normal text-slate-950">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Move this drive to the next meaningful status when rounds change.
              </p>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  const isActive = drive.status === action.status

                  return (
                    <button
                      key={action.status}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 text-left text-sm font-semibold transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800'
                      }`}
                      disabled={Boolean(isUpdatingStatus) || isActive}
                      onClick={() => updateStatus(action.status)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={17} aria-hidden="true" />
                        {action.label}
                      </span>
                      {isUpdatingStatus === action.status && (
                        <span className="text-xs text-slate-500">Saving...</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {statusError && (
                <p className="mt-3 text-sm font-semibold text-rose-700">
                  {statusError}
                </p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <CalendarCheck size={18} aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold tracking-normal text-slate-950">
                  Reminder Information
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {reminders.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm font-semibold text-slate-500">
                    No active upcoming reminders for this drive.
                  </p>
                )}

                {reminders.map((reminder) => (
                  <article
                    key={reminder.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {reminder.eventLabel}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(reminder.eventDate)} - {reminder.countdownLabel}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      {reminder.categoryLabel} / {reminder.indicator}
                    </p>
                  </article>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      )}
    </>
  )
}
