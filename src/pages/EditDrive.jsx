import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import { DRIVE_STATUSES } from '../constants/driveStatus.js'
import { getDriveById, updateDrive } from '../services/driveService.js'
import { toDateInputValue } from '../utils/dateFormatting.js'

const fields = [
  { id: 'companyName', label: 'Company Name', type: 'text', required: true },
  { id: 'role', label: 'Role', type: 'text', required: true },
  {
    id: 'registrationDeadline',
    label: 'Registration Deadline',
    type: 'date',
    required: true,
  },
  { id: 'testDate', label: 'Test Date', type: 'date' },
  { id: 'interviewDate', label: 'Interview Date', type: 'date' },
  { id: 'packageCtc', label: 'Package/CTC', type: 'text' },
  { id: 'location', label: 'Location', type: 'text' },
]

const emptyForm = {
  companyName: '',
  role: '',
  registrationDeadline: '',
  testDate: '',
  interviewDate: '',
  eligibilityCriteria: '',
  packageCtc: '',
  location: '',
  status: 'Applied',
  notes: '',
}

function mapDriveToForm(drive) {
  return {
    companyName: drive.companyName || '',
    role: drive.role || '',
    registrationDeadline: toDateInputValue(drive.registrationDeadline),
    testDate: toDateInputValue(drive.testDate),
    interviewDate: toDateInputValue(drive.interviewDate),
    eligibilityCriteria: drive.eligibilityCriteria || '',
    packageCtc: drive.packageCtc || '',
    location: drive.location || '',
    status: drive.status || 'Applied',
    notes: drive.notes || '',
  }
}

export default function EditDrive() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDrive() {
      try {
        setIsLoading(true)
        setPageError('')
        const drive = await getDriveById(id)

        if (isMounted) {
          setForm(mapDriveToForm(drive))
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message)
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

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  function validateForm() {
    const nextErrors = {}

    fields.forEach((field) => {
      if (field.required && !form[field.id].trim()) {
        nextErrors[field.id] = `${field.label} is required`
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      await updateDrive(id, form)
      navigate(`/drives/${id}`)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Edit Drive"
        title="Update placement drive"
        description="Edit application details, dates, notes, and the current pipeline status."
        action={
          <Button as="link" to={`/drives/${id}`} variant="secondary">
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </Button>
        }
      />

      {isLoading && (
        <LoadingState rows={4} title="Loading placement drive" />
      )}

      {!isLoading && pageError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-8 text-sm font-semibold text-rose-700">
          {pageError}
        </div>
      )}

      {!isLoading && !pageError && (
        <Card
          as="form"
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-sm font-bold text-indigo-950">Update drive details</p>
            <p className="mt-1 text-sm leading-6 text-indigo-950/70">
              Keep the application profile, timeline, and notes accurate for
              reminder and dashboard views.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.id} className="block">
                <span className="text-sm font-bold text-slate-700">
                  {field.label}
                </span>
                <input
                  className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors[field.id]
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                  name={field.id}
                  onChange={updateField}
                  placeholder={field.type === 'text' ? field.label : undefined}
                  required={field.required}
                  type={field.type}
                  value={form[field.id]}
                />
                {errors[field.id] && (
                  <p className="mt-2 text-sm font-semibold text-rose-700">
                    {errors[field.id]}
                  </p>
                )}
              </label>
            ))}

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Status</span>
              <select
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                name="status"
                onChange={updateField}
                value={form.status}
              >
                {DRIVE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">
                Eligibility Criteria
              </span>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                name="eligibilityCriteria"
                onChange={updateField}
                placeholder="Add branches, CGPA, backlog rules, batch, or other eligibility details."
                value={form.eligibilityCriteria}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">Notes</span>
              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                name="notes"
                onChange={updateField}
                placeholder="Add preparation notes, links, eligibility details, or round-specific reminders."
                value={form.notes}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button disabled={isSubmitting} type="submit">
              <Save size={18} aria-hidden="true" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              to="/dashboard"
            >
              Cancel
            </Link>
            {submitError && (
              <p className="text-sm font-semibold text-rose-700">
                {submitError}
              </p>
            )}
          </div>
        </Card>
      )}
    </>
  )
}
