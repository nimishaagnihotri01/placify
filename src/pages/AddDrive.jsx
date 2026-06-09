import { Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import {
  DEFAULT_DRIVE_STATUS,
  DRIVE_STATUSES,
} from '../constants/driveStatus.js'
import { createDrive } from '../services/driveService.js'

const initialForm = {
  companyName: '',
  role: '',
  registrationDeadline: '',
  testDate: '',
  interviewDate: '',
  eligibilityCriteria: '',
  packageCtc: '',
  status: DEFAULT_DRIVE_STATUS,
  notes: '',
}

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
]

export default function AddDrive() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saved, setSaved] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
    setSaved(false)
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
      await createDrive({
        ...form,
        testDate: form.testDate || undefined,
        interviewDate: form.interviewDate || undefined,
      })
      setSaved(true)
      setForm(initialForm)
      window.setTimeout(() => {
        navigate('/dashboard')
      }, 900)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Add Drive"
        title="Create a placement drive entry"
        description="Save placement drive details to your Placify backend and keep the dashboard in sync."
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} className="block">
              <span className="text-sm font-bold text-slate-700">
                {field.label}
              </span>
              <input
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
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
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
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
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              name="eligibilityCriteria"
              onChange={updateField}
              placeholder="Add branches, CGPA, backlog rules, batch, or other eligibility details."
              value={form.eligibilityCriteria}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Notes</span>
            <textarea
              className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
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
            {isSubmitting ? 'Saving...' : 'Save Drive'}
          </Button>
          {submitError && (
            <p className="text-sm font-semibold text-rose-700">{submitError}</p>
          )}
          {saved && (
            <p className="text-sm font-semibold text-teal-800">
              Drive saved successfully. Redirecting to dashboard...
            </p>
          )}
        </div>
      </form>
    </>
  )
}
