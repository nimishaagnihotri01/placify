import { Edit3, Eye, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DRIVE_STATUSES } from '../../constants/driveStatus.js'
import { deleteDrive } from '../../services/driveService.js'
import { formatDate } from '../../utils/dateFormatting.js'
import Button from '../common/Button.jsx'
import StatusBadge from './StatusBadge.jsx'

const sortOptions = [
  { value: 'nearestDeadline', label: 'Nearest Deadline' },
  { value: 'newestCreated', label: 'Newest Created' },
  { value: 'companyName', label: 'Company Name' },
]

function getTimeValue(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY
  }

  const time = new Date(dateValue).getTime()
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

export default function DriveTable({
  drives = [],
  error = '',
  isLoading = false,
  onDriveDeleted,
}) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('')
  const [sortBy, setSortBy] = useState('nearestDeadline')
  const [driveToDelete, setDriveToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredDrives = useMemo(() => {
    const companyQuery = companyFilter.trim().toLowerCase()

    return drives
      .filter((drive) => {
        const matchesStatus =
          statusFilter === 'All' || drive.status === statusFilter
        const matchesCompany =
          !companyQuery ||
          drive.companyName?.toLowerCase().includes(companyQuery)

        return matchesStatus && matchesCompany
      })
      .sort((first, second) => {
        if (sortBy === 'companyName') {
          return (first.companyName || '').localeCompare(
            second.companyName || '',
          )
        }

        if (sortBy === 'newestCreated') {
          return getTimeValue(second.createdAt) - getTimeValue(first.createdAt)
        }

        return (
          getTimeValue(first.registrationDeadline) -
          getTimeValue(second.registrationDeadline)
        )
      })
  }, [companyFilter, drives, sortBy, statusFilter])

  async function confirmDelete() {
    if (!driveToDelete) {
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError('')
      await deleteDrive(driveToDelete._id)
      onDriveDeleted?.(driveToDelete._id)
      setDriveToDelete(null)
    } catch (deleteDriveError) {
      setDeleteError(deleteDriveError.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-normal text-slate-950">
            Recent Placement Drives
          </h2>
          <p className="text-sm text-slate-500">
            Live records synced from your Placify backend.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <span className="sr-only">Filter by company name</span>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden="true"
            />
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setCompanyFilter(event.target.value)}
              placeholder="Filter company name"
              type="search"
              value={companyFilter}
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="All">All Statuses</option>
              {DRIVE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Sort drives</span>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="px-5 py-10 text-sm font-semibold text-slate-500">
          Loading placement drives...
        </div>
      )}

      {!isLoading && error && (
        <div className="px-5 py-10 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && drives.length === 0 && (
        <div className="px-5 py-10 text-sm font-semibold text-slate-500">
          No placement drives found. Add your first drive to start tracking.
        </div>
      )}

      {!isLoading && !error && drives.length > 0 && filteredDrives.length === 0 && (
        <div className="px-5 py-10 text-sm font-semibold text-slate-500">
          No placement drives match the current filters.
        </div>
      )}

      {!isLoading && !error && filteredDrives.length > 0 && (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Company</th>
              <th className="px-5 py-3 font-bold">Role</th>
              <th className="px-5 py-3 font-bold">Deadline</th>
              <th className="px-5 py-3 font-bold">Test</th>
              <th className="px-5 py-3 font-bold">Interview</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDrives.map((drive) => (
              <tr key={drive._id} className="text-slate-700">
                <td className="px-5 py-4 font-bold text-slate-950">
                  {drive.companyName}
                </td>
                <td className="px-5 py-4">{drive.role}</td>
                <td className="px-5 py-4">
                  {formatDate(drive.registrationDeadline)}
                </td>
                <td className="px-5 py-4">{formatDate(drive.testDate)}</td>
                <td className="px-5 py-4">{formatDate(drive.interviewDate)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={drive.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                      to={`/drives/${drive._id}`}
                      aria-label={`View ${drive.companyName}`}
                      title="View"
                    >
                      <Eye size={17} aria-hidden="true" />
                    </Link>
                    <Link
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                      to={`/drives/${drive._id}/edit`}
                      aria-label={`Edit ${drive.companyName}`}
                      title="Edit"
                    >
                      <Edit3 size={17} aria-hidden="true" />
                    </Link>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => {
                        setDriveToDelete(drive)
                        setDeleteError('')
                      }}
                      type="button"
                      aria-label={`Delete ${drive.companyName}`}
                      title="Delete"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {driveToDelete && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-drive-title"
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <h3
              id="delete-drive-title"
              className="text-lg font-bold tracking-normal text-slate-950"
            >
              Delete placement drive?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will remove {driveToDelete.companyName} - {driveToDelete.role}
              from your placement tracker.
            </p>
            {deleteError && (
              <p className="mt-3 text-sm font-semibold text-rose-700">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                disabled={isDeleting}
                onClick={() => setDriveToDelete(null)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-700 shadow-rose-900/10 hover:bg-rose-800 focus:ring-rose-700"
                disabled={isDeleting}
                onClick={confirmDelete}
                type="button"
              >
                {isDeleting ? 'Deleting...' : 'Delete Drive'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
