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
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-normal text-slate-950">
                June 2026
              </h2>
              <p className="text-sm text-slate-500">Placement events preview</p>
            </div>
            <span className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">
              4 events
            </span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const eventType = highlightedDays[day]

              return (
                <div
                  key={day}
                  className={`flex min-h-20 flex-col rounded-lg border p-2 text-sm ${
                    eventType
                      ? 'border-teal-200 bg-teal-50 text-teal-950'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {eventType && (
                    <span className="mt-auto rounded-md bg-white px-2 py-1 text-xs font-bold text-teal-800">
                      {eventType}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold tracking-normal text-slate-950">
            Sample Events
          </h2>
          <div className="mt-5 space-y-4">
            {calendarEvents.map((event) => (
              <article
                key={event.id}
                className="flex gap-3 rounded-lg border border-slate-200 p-4"
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
        </aside>
      </div>
    </>
  )
}
