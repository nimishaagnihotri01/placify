import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Inbox,
  MailCheck,
  MailPlus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import {
  approveGmailOpportunity,
  disconnectGmail,
  getGmailAuthUrl,
  getGmailOpportunities,
  getGmailStatus,
  ignoreGmailOpportunity,
  syncGmail,
} from '../services/gmailService.js'

const editableFields = [
  { id: 'companyName', label: 'Company Name', required: true },
  { id: 'role', label: 'Job Role', required: true },
  {
    id: 'registrationDeadline',
    label: 'Registration Deadline',
    type: 'date',
    required: true,
  },
  { id: 'testDate', label: 'Test Date', type: 'date' },
  { id: 'interviewDate', label: 'Interview Date', type: 'date' },
  { id: 'packageCtc', label: 'Package / CTC' },
  { id: 'location', label: 'Location' },
  { id: 'eligibilityCriteria', label: 'Eligibility Criteria', type: 'textarea' },
  { id: 'notes', label: 'Notes', type: 'textarea' },
]

const statusClasses = {
  pending: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  imported: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  ignored: 'bg-slate-100 text-slate-700 ring-slate-200',
  duplicate: 'bg-amber-50 text-amber-800 ring-amber-100',
}

function formatDateTime(value) {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getInitialStatus() {
  return {
    isConnected: false,
    email: '',
    lastSyncAt: null,
    lastSyncStatus: 'Disconnected',
    lastSyncError: '',
    placementEmailsFound: 0,
    importedCount: 0,
    ignoredCount: 0,
    pendingCount: 0,
    duplicateCount: 0,
  }
}

export default function GmailSync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState(getInitialStatus)
  const [opportunities, setOpportunities] = useState([])
  const [edits, setEdits] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const pendingOpportunities = useMemo(
    () =>
      opportunities.filter(
        (opportunity) =>
          opportunity.status === 'pending' || opportunity.status === 'duplicate',
      ),
    [opportunities],
  )

  useEffect(() => {
    let isMounted = true

    async function loadGmailSync() {
      try {
        setIsLoading(true)
        setError('')
        const [nextStatus, nextOpportunities] = await Promise.all([
          getGmailStatus(),
          getGmailOpportunities(),
        ])

        if (isMounted) {
          setStatus(nextStatus)
          setOpportunities(nextOpportunities)
          setEdits(
            nextOpportunities.reduce((result, opportunity) => {
              result[opportunity._id] = opportunity.extracted
              return result
            }, {}),
          )
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

    loadGmailSync()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const oauthError = searchParams.get('gmail_error')
    const connected = searchParams.get('connected')

    if (oauthError) {
      setError(`Gmail connection failed: ${oauthError}`)
      setSearchParams({}, { replace: true })
    }

    if (connected) {
      setMessage('Gmail connected successfully. You can sync placement emails now.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function updateEdit(opportunityId, field, value) {
    setEdits((current) => ({
      ...current,
      [opportunityId]: {
        ...current[opportunityId],
        [field]: value,
      },
    }))
    setError('')
    setMessage('')
  }

  async function refreshData(successMessage = '') {
    const [nextStatus, nextOpportunities] = await Promise.all([
      getGmailStatus(),
      getGmailOpportunities(),
    ])
    setStatus(nextStatus)
    setOpportunities(nextOpportunities)
    setEdits(
      nextOpportunities.reduce((result, opportunity) => {
        result[opportunity._id] = opportunity.extracted
        return result
      }, {}),
    )

    if (successMessage) {
      setMessage(successMessage)
    }
  }

  async function handleConnect() {
    try {
      setIsConnecting(true)
      setError('')
      const authUrl = await getGmailAuthUrl()
      window.location.href = authUrl
    } catch (connectError) {
      setError(connectError.message)
      setIsConnecting(false)
    }
  }

  async function handleDisconnect() {
    try {
      setError('')
      await disconnectGmail()
      await refreshData('Gmail disconnected.')
    } catch (disconnectError) {
      setError(disconnectError.message)
    }
  }

  async function handleSync() {
    try {
      setIsSyncing(true)
      setError('')
      setMessage('')
      const result = await syncGmail()
      await refreshData(
        `${result.opportunitiesDetected} placement opportunities detected from ${result.placementEmailsFound} matching emails.`,
      )
    } catch (syncError) {
      setError(syncError.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleApprove(opportunity) {
    try {
      setWorkingId(opportunity._id)
      setError('')
      setMessage('')
      const response = await approveGmailOpportunity(
        opportunity._id,
        edits[opportunity._id] || opportunity.extracted,
      )

      await refreshData(
        response.duplicate
          ? 'Already tracked'
          : 'Placement drive saved to Placify.',
      )
    } catch (approveError) {
      setError(approveError.message)
    } finally {
      setWorkingId('')
    }
  }

  async function handleIgnore(opportunity) {
    try {
      setWorkingId(opportunity._id)
      setError('')
      await ignoreGmailOpportunity(opportunity._id)
      await refreshData('Opportunity ignored.')
    } catch (ignoreError) {
      setError(ignoreError.message)
    } finally {
      setWorkingId('')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Gmail Sync"
        title="Sync placement opportunities from Gmail"
        description="Connect Gmail, fetch recent placement-related emails, review extracted details, and approve only the drives you want to track."
      />

      {isLoading && <LoadingState rows={4} title="Loading Gmail sync" />}

      {!isLoading && (
        <>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ring-1 ${
                      status.isConnected
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                        : 'bg-indigo-50 text-indigo-700 ring-indigo-100'
                    }`}
                  >
                    {status.isConnected ? (
                      <MailCheck size={23} aria-hidden="true" />
                    ) : (
                      <MailPlus size={23} aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-indigo-700">
                      Google OAuth
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                      {status.isConnected ? 'Gmail connected' : 'Connect Gmail'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {status.isConnected
                        ? status.email
                        : 'Placify uses read-only Gmail access to detect placement notices. It never stores your Gmail password.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {status.isConnected ? (
                    <>
                      <Button
                        disabled={isSyncing}
                        onClick={handleSync}
                        type="button"
                      >
                        <RefreshCw
                          className={isSyncing ? 'animate-spin' : ''}
                          size={18}
                          aria-hidden="true"
                        />
                        {isSyncing ? 'Syncing...' : 'Sync Gmail'}
                      </Button>
                      <Button
                        onClick={handleDisconnect}
                        type="button"
                        variant="secondary"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      disabled={isConnecting}
                      onClick={handleConnect}
                      type="button"
                    >
                      <ExternalLink size={18} aria-hidden="true" />
                      {isConnecting ? 'Opening Google...' : 'Connect Gmail'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Last Sync
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {formatDateTime(status.lastSyncAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Found
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {status.placementEmailsFound} emails
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Imported
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {status.importedCount} drives
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Review
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {status.pendingCount} pending
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <ShieldCheck size={19} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-950">
                    Security posture
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    OAuth only, read-only Gmail scope, encrypted token storage.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Sync status
                </p>
                <p className="mt-2 text-sm font-bold text-slate-950">
                  {status.lastSyncStatus}
                </p>
                {status.lastSyncError && (
                  <p className="mt-2 text-sm font-semibold text-rose-700">
                    {status.lastSyncError}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {(message || error) && (
            <div
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-semibold ${
                error
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {error || message}
            </div>
          )}

          <section className="mt-6">
            <SectionHeader
              title="Placement Opportunity Detected"
              description="Review extracted Gmail results before creating placement drives."
              icon={Inbox}
              action={
                <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                  <Clock3 size={16} aria-hidden="true" />
                  {pendingOpportunities.length} to review
                </span>
              }
            />

            {!status.isConnected && (
              <EmptyState
                icon={MailPlus}
                title="Connect Gmail to start"
                description="After connecting, click Sync Gmail to fetch recent placement emails for review."
              />
            )}

            {status.isConnected && opportunities.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="No Gmail opportunities yet"
                description="Run Sync Gmail to search recent emails for placement drives, assessments, interviews, CTC, and job profile details."
              />
            )}

            <div className="space-y-4">
              {opportunities.map((opportunity) => {
                const extracted = edits[opportunity._id] || opportunity.extracted
                const isWorking = workingId === opportunity._id
                const isClosed =
                  opportunity.status === 'imported' ||
                  opportunity.status === 'ignored'

                return (
                  <Card key={opportunity._id} className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold tracking-normal text-slate-950">
                            {extracted.companyName || 'Placement opportunity'}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                              statusClasses[opportunity.status] ||
                              statusClasses.pending
                            }`}
                          >
                            {opportunity.status}
                          </span>
                          {opportunity.duplicateDriveId && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-100">
                              <AlertTriangle size={13} aria-hidden="true" />
                              Already tracked
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {opportunity.subject || 'No subject'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {opportunity.from} / {formatDateTime(opportunity.receivedAt)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        {!isClosed && (
                          <>
                            <Button
                              disabled={isWorking}
                              onClick={() => handleApprove(opportunity)}
                              type="button"
                            >
                              <CheckCircle2 size={18} aria-hidden="true" />
                              {isWorking ? 'Saving...' : 'Approve'}
                            </Button>
                            <Button
                              disabled={isWorking}
                              onClick={() => handleIgnore(opportunity)}
                              type="button"
                              variant="secondary"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                              Ignore
                            </Button>
                          </>
                        )}
                        {opportunity.createdDriveId && (
                          <Button
                            as="link"
                            to={`/drives/${opportunity.createdDriveId}`}
                            variant="secondary"
                          >
                            View Drive
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                      {editableFields.map((field) => {
                        const isTextarea = field.type === 'textarea'
                        const isRequiredMissing =
                          field.required && !extracted[field.id]

                        return (
                          <label
                            key={field.id}
                            className={isTextarea ? 'md:col-span-2 xl:col-span-3' : ''}
                          >
                            <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-700">
                              {field.label}
                              {field.required && (
                                <span className="text-xs text-slate-400">
                                  Required
                                </span>
                              )}
                            </span>
                            {isTextarea ? (
                              <textarea
                                className={`mt-2 min-h-24 w-full resize-y rounded-lg border bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                  isRequiredMissing
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                                }`}
                                disabled={isClosed}
                                onChange={(event) =>
                                  updateEdit(
                                    opportunity._id,
                                    field.id,
                                    event.target.value,
                                  )
                                }
                                value={extracted[field.id] || ''}
                              />
                            ) : (
                              <input
                                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                                  isRequiredMissing
                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                                }`}
                                disabled={isClosed}
                                onChange={(event) =>
                                  updateEdit(
                                    opportunity._id,
                                    field.id,
                                    event.target.value,
                                  )
                                }
                                type={field.type || 'text'}
                                value={extracted[field.id] || ''}
                              />
                            )}
                          </label>
                        )
                      })}
                    </div>

                    {opportunity.snippet && (
                      <div className="border-t border-slate-200 px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Gmail snippet
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {opportunity.snippet}
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {opportunities.some((opportunity) => opportunity.status === 'imported') && (
              <div className="mt-5 text-sm font-semibold text-slate-600">
                Imported drives are available on the{' '}
                <Link className="text-indigo-700 hover:text-indigo-900" to="/dashboard">
                  dashboard
                </Link>
                .
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
