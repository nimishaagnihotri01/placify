import { BriefcaseBusiness, Edit3, Eye, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DRIVE_STATUSES } from '../../constants/driveStatus.js'
import { deleteDrive } from '../../services/driveService.js'
import { formatDate } from '../../utils/dateFormatting.js'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import EmptyState from '../common/EmptyState.jsx'
import LoadingState from '../common/LoadingState.jsx'
import SectionHeader from '../common/SectionHeader.jsx'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('nearestDeadline')
  const [driveToDelete, setDriveToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const searchQuery = searchParams.get('q') || ''

  const filteredDrives = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return drives
      .filter((drive) => {
        const matchesStatus =
          statusFilter === 'All' || drive.status === statusFilter
        const matchesSearch =
          !normalizedQuery ||
          drive.companyName?.toLowerCase().includes(normalizedQuery) ||
          drive.role?.toLowerCase().includes(normalizedQuery)

        return matchesStatus && matchesSearch
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
  }, [drives, searchQuery, sortBy, statusFilter])

  function updateSearch(event) {
    const value = event.target.value
    const nextParams = new URLSearchParams(searchParams)

    if (value.trim()) {
      nextParams.set('q', value)
    } else {
      nextParams.delete('q')
    }

    setSearchParams(nextParams, { replace: true })
  }

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
    <section>
      <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4">
        <SectionHeader
          title="Recent Placement Drives"
          description="Live records synced from your Placify backend."
          icon={BriefcaseBusiness}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <span className="sr-only">Search by company or role</span>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden="true"
            />
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              onChange={updateSearch}
              placeholder="Search company or role"
              type="search"
              value={searchQuery}
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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

      {isLoading && <div className="p-5"><LoadingState rows={4} /></div>}

      {!isLoading && error && (
        <div className="px-5 py-10 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && drives.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={BriefcaseBusiness}
            title="No placement drives yet"
            description="Add your first drive to start tracking company deadlines, rounds, and notes."
          />
        </div>
      )}

      {!isLoading && !error && drives.length > 0 && filteredDrives.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={Search}
            title="No matching drives"
            description="Adjust the search query, status filter, or sort option to find a drive."
          />
        </div>
      )}

      {!isLoading && !error && filteredDrives.length > 0 && (
      <>
      <div className="hidden overflow-x-auto md:block">
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
              <tr
                key={drive._id}
                className="text-slate-700 transition hover:bg-indigo-50/40"
              >
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
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      to={`/drives/${drive._id}`}
                      aria-label={`View ${drive.companyName}`}
                      title="View"
                    >
                      <Eye size={17} aria-hidden="true" />
                    </Link>
                    <Link
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
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
      <div className="space-y-3 p-4 md:hidden">
        {filteredDrives.map((drive) => (
          <article
            key={drive._id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-950">
                  {drive.companyName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{drive.role}</p>
              </div>
              <StatusBadge status={drive.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Deadline
                </dt>
                <dd className="mt-1 font-semibold text-slate-700">
                  {formatDate(drive.registrationDeadline)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Test
                </dt>
                <dd className="mt-1 font-semibold text-slate-700">
                  {formatDate(drive.testDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Interview
                </dt>
                <dd className="mt-1 font-semibold text-slate-700">
                  {formatDate(drive.interviewDate)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center gap-2">
              <Link
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                to={`/drives/${drive._id}`}
              >
                <Eye size={16} aria-hidden="true" />
                View
              </Link>
              <Link
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                to={`/drives/${drive._id}/edit`}
                aria-label={`Edit ${drive.companyName}`}
                title="Edit"
              >
                <Edit3 size={16} aria-hidden="true" />
              </Link>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => {
                  setDriveToDelete(drive)
                  setDeleteError('')
                }}
                type="button"
                aria-label={`Delete ${drive.companyName}`}
                title="Delete"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      </>
      )}
      </Card>

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
                disabled={isDeleting}
                onClick={confirmDelete}
                type="button"
                variant="danger"
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
