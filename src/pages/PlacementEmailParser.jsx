import {
  ClipboardPaste,
  FilePlus2,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import { DEFAULT_DRIVE_STATUS } from '../constants/driveStatus.js'
import { createDrive } from '../services/driveService.js'
import {
  SAMPLE_PLACEMENT_EMAILS,
  extractPlacementEmail,
} from '../utils/placementEmailParser.js'

const emptyForm = {
  companyName: '',
  role: '',
  registrationDeadline: '',
  testDate: '',
  interviewDate: '',
  eligibilityCriteria: '',
  packageCtc: '',
  notes: '',
}

const emptyConfidence = Object.keys(emptyForm).reduce((confidence, field) => {
  confidence[field] = 'Low'
  return confidence
}, {})

const previewFields = [
  {
    id: 'companyName',
    label: 'Company Name',
    type: 'text',
    required: true,
    placeholder: 'Missing company name',
  },
  {
    id: 'role',
    label: 'Role',
    type: 'text',
    required: true,
    placeholder: 'Missing role',
  },
  {
    id: 'registrationDeadline',
    label: 'Registration Deadline',
    type: 'date',
    required: true,
    placeholder: 'Missing deadline',
  },
  {
    id: 'testDate',
    label: 'Test Date',
    type: 'date',
    placeholder: 'No test date found',
  },
  {
    id: 'interviewDate',
    label: 'Interview Date',
    type: 'date',
    placeholder: 'No interview date found',
  },
  {
    id: 'packageCtc',
    label: 'Package/CTC',
    type: 'text',
    placeholder: 'No package found',
  },
  {
    id: 'eligibilityCriteria',
    label: 'Eligibility Criteria',
    type: 'textarea',
    placeholder: 'No eligibility criteria found',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'No notes found',
  },
]

const confidenceClasses = {
  High: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  Low: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function getFieldInputClass(hasError) {
  const baseClass =
    'mt-3 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4'

  return hasError
    ? `${baseClass} border-rose-300 focus:border-rose-500 focus:ring-rose-100`
    : `${baseClass} border-slate-200 focus:border-teal-600 focus:ring-teal-100`
}

function buildExtractionForm(extractedFields) {
  return Object.keys(emptyForm).reduce((form, field) => {
    form[field] = extractedFields[field]?.value || ''
    return form
  }, {})
}

function buildExtractionConfidence(extractedFields) {
  return Object.keys(emptyForm).reduce((confidence, field) => {
    confidence[field] = extractedFields[field]?.confidence || 'Low'
    return confidence
  }, {})
}

export default function PlacementEmailParser() {
  const navigate = useNavigate()
  const [emailContent, setEmailContent] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [confidence, setConfidence] = useState(emptyConfidence)
  const [hasExtracted, setHasExtracted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const extractedCount = useMemo(
    () => Object.values(form).filter((value) => value.trim()).length,
    [form],
  )

  function handleExtract() {
    const extractedFields = extractPlacementEmail(emailContent)
    setForm(buildExtractionForm(extractedFields))
    setConfidence(buildExtractionConfidence(extractedFields))
    setHasExtracted(true)
    setErrors({})
    setSubmitError('')
  }

  function loadSample(sample) {
    setEmailContent(sample.content)
    const extractedFields = extractPlacementEmail(sample.content)
    setForm(buildExtractionForm(extractedFields))
    setConfidence(buildExtractionConfidence(extractedFields))
    setHasExtracted(true)
    setErrors({})
    setSubmitError('')
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  function validateForm() {
    const nextErrors = {}

    previewFields.forEach((field) => {
      if (field.required && !form[field.id].trim()) {
        nextErrors[field.id] = `${field.label} is required before creating a drive`
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleCreateDrive(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      const createdDrive = await createDrive({
        ...form,
        status: DEFAULT_DRIVE_STATUS,
        testDate: form.testDate || undefined,
        interviewDate: form.interviewDate || undefined,
        eligibilityCriteria: form.eligibilityCriteria || undefined,
        packageCtc: form.packageCtc || undefined,
        notes: form.notes || undefined,
      })

      navigate(`/drives/${createdDrive._id}`)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Email Parser"
        title="Placement Email Parser"
        description="Paste a placement email, extract structured drive details with local regex parsing, review the confidence, and save it to your tracker."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-slate-950">
                Paste email content
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Parsing runs entirely in the browser with no paid or external AI APIs.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-teal-800">
              <Sparkles size={15} aria-hidden="true" />
              Rule based
            </span>
          </div>

          <label className="mt-5 block">
            <span className="sr-only">Paste email content</span>
            <textarea
              className="min-h-[360px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setEmailContent(event.target.value)}
              placeholder="Paste placement email content here..."
              value={emailContent}
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              disabled={!emailContent.trim()}
              onClick={handleExtract}
              type="button"
            >
              <Wand2 size={18} aria-hidden="true" />
              Extract Information
            </Button>
            <Button
              disabled={!emailContent && !hasExtracted}
              onClick={() => {
                setEmailContent('')
                setForm(emptyForm)
                setConfidence(emptyConfidence)
                setHasExtracted(false)
                setErrors({})
                setSubmitError('')
              }}
              type="button"
              variant="secondary"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Reset
            </Button>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-50 text-cyan-800">
              <ClipboardPaste size={18} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold tracking-normal text-slate-950">
              Sample emails
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {SAMPLE_PLACEMENT_EMAILS.map((sample) => (
              <button
                key={sample.title}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-teal-200 hover:bg-teal-50"
                onClick={() => loadSample(sample)}
                type="button"
              >
                <span className="block text-sm font-bold text-slate-950">
                  {sample.title}
                </span>
                <span className="mt-1 block line-clamp-3 text-sm leading-6 text-slate-600">
                  {sample.content}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <form onSubmit={handleCreateDrive} className="mt-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-normal text-slate-950">
                Extracted preview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {hasExtracted
                  ? `${extractedCount} of ${previewFields.length} fields found. Edit anything before saving.`
                  : 'Run extraction or load a sample to review parsed fields.'}
              </p>
            </div>
            {hasExtracted && (
              <div className="flex flex-wrap gap-2">
                {['High', 'Medium', 'Low'].map((level) => (
                  <span
                    key={level}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${confidenceClasses[level]}`}
                  >
                    {level}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {previewFields.map((field) => {
              const isTextarea = field.type === 'textarea'
              const hasError = Boolean(errors[field.id])

              return (
                <label
                  key={field.id}
                  className={`block rounded-lg border p-4 ${
                    hasError
                      ? 'border-rose-200 bg-rose-50'
                      : 'border-slate-200 bg-slate-50'
                  } ${isTextarea ? 'md:col-span-2' : ''}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      {field.label}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${confidenceClasses[confidence[field.id]]}`}
                    >
                      {confidence[field.id]}
                    </span>
                  </span>

                  {isTextarea ? (
                    <textarea
                      className={`${getFieldInputClass(hasError)} min-h-28 py-3`}
                      name={field.id}
                      onChange={updateField}
                      placeholder={field.placeholder}
                      value={form[field.id]}
                    />
                  ) : (
                    <input
                      className={`${getFieldInputClass(hasError)} h-11`}
                      name={field.id}
                      onChange={updateField}
                      placeholder={field.placeholder}
                      type={field.type}
                      value={form[field.id]}
                    />
                  )}

                  {errors[field.id] && (
                    <p className="mt-2 text-sm font-semibold text-rose-700">
                      {errors[field.id]}
                    </p>
                  )}
                </label>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button disabled={isSubmitting || !hasExtracted} type="submit">
              <FilePlus2 size={18} aria-hidden="true" />
              {isSubmitting ? 'Creating...' : 'Create Placement Drive'}
            </Button>
            {submitError && (
              <p className="text-sm font-semibold text-rose-700">
                {submitError}
              </p>
            )}
          </div>
        </section>
      </form>
    </>
  )
}
