import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  ClipboardList,
  LineChart,
} from 'lucide-react'
import BrandLogo from '../components/common/BrandLogo.jsx'
import Button from '../components/common/Button.jsx'

const features = [
  {
    title: 'Track every drive',
    description:
      'Keep company roles, registration deadlines, tests, interviews, and notes organized.',
    icon: ClipboardList,
  },
  {
    title: 'Plan upcoming rounds',
    description:
      'See what needs attention this week before placement tasks pile up.',
    icon: CalendarCheck,
  },
  {
    title: 'Stay reminder-ready',
    description:
      'A frontend foundation prepared for future reminders, alerts, and backend workflows.',
    icon: BellRing,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <BrandLogo />
        <Button as="link" to="/dashboard" variant="secondary">
          Dashboard
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:pb-20 lg:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 shadow-sm">
              <LineChart size={16} aria-hidden="true" />
              Placement drive command center
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Never Miss a Placement Opportunity Again
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Placify helps students organize applied drives, upcoming tests,
              interview schedules, and registration deadlines in a clean,
              placement-focused workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="link" to="/dashboard">
                Open Dashboard
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
              <Button as="link" to="/add-drive" variant="secondary">
                Add Sample Drive
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-teal-200">Today</p>
                  <p className="text-xl font-bold">Placement Snapshot</p>
                </div>
                <span className="rounded-lg bg-teal-500 px-3 py-1 text-sm font-bold text-white">
                  4 active
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  ['TCS Digital', 'Registration closes Jun 10'],
                  ['Infosys', 'Online assessment Jun 15'],
                  ['Deloitte', 'Interview prep due this week'],
                ].map(([company, detail]) => (
                  <div
                    key={company}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-bold">{company}</p>
                    <p className="mt-1 text-sm text-slate-300">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-800">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-xl font-bold tracking-normal">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
