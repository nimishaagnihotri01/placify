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
import PageHeader from '../components/dashboard/PageHeader.jsx'
import StatusBadge from '../components/dashboard/StatusBadge.jsx'
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
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-500 shadow-sm">
          Loading placement drive...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-8 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && drive && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Current Status
                </dt>
                <dd className="mt-2">
                  <StatusBadge status={drive.status} />
                </dd>
              </div>
            </dl>

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
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold tracking-normal text-slate-950">
                Quick Actions
              </h2>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  const isActive = drive.status === action.status

                  return (
                    <button
                      key={action.status}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 text-left text-sm font-semibold transition ${
                        isActive
                          ? 'border-teal-200 bg-teal-50 text-teal-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800'
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
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-50 text-teal-800">
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
            </section>
          </aside>
        </div>
      )}
    </>
  )
}
