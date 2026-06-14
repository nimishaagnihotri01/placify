import Card from '../components/common/Card.jsx'
import PageHeader from '../components/dashboard/PageHeader.jsx'
import { calendarEvents } from '../data/placementDrives.js'

const days = Array.from({ length: 30 }, (_, index) => index + 1)
const highlightedDays = {
  10: 'Deadline',
  15: 'Test',
  20: 'Interview',
  24: 'Interview',
}

export default function Calendar() {
  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Upcoming placement timeline"
        description="A placeholder calendar layout with sample events for tests, interviews, and registration deadlines."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-normal text-slate-950">
                June 2026
              </h2>
              <p className="text-sm text-slate-500">Placement events preview</p>
            </div>
            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 ring-1 ring-indigo-100">
              4 events
            </span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:gap-2 sm:text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day) => {
              const eventType = highlightedDays[day]

              return (
                <div
                  key={day}
                  className={`flex min-h-16 flex-col rounded-lg border p-1.5 text-xs transition sm:min-h-20 sm:p-2 sm:text-sm ${
                    eventType
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-950 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {eventType && (
                    <span className="mt-auto truncate rounded-md bg-white px-1.5 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-100 sm:px-2 sm:text-xs">
                      {eventType}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card as="aside" className="p-5">
          <h2 className="text-xl font-bold tracking-normal text-slate-950">
            Sample Events
          </h2>
          <div className="mt-5 space-y-4">
            {calendarEvents.map((event) => (
              <article
                key={event.id}
                className="flex gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${event.accent}`}
                />
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {event.date} - {event.type}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {event.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
