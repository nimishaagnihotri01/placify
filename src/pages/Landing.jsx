import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  ClipboardList,
  MailSearch,
  LineChart,
  ShieldCheck,
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
      'Spot urgent deadlines, tests, and interviews before they become last-minute work.',
    icon: BellRing,
  },
  {
    title: 'Parse placement emails',
    description:
      'Turn messy placement notices into clean drive entries that are ready to review.',
    icon: MailSearch,
  },
  {
    title: 'Review pipeline health',
    description:
      'Understand where every application stands with a simple placement pipeline.',
    icon: LineChart,
  },
  {
    title: 'Keep data organized',
    description:
      'Use one reliable workspace for roles, CTC, eligibility, notes, and next actions.',
    icon: ShieldCheck,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <BrandLogo />
        <Button as="link" to="/dashboard" variant="secondary">
          Dashboard
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white pt-24">
          <div className="absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[72%] bg-[linear-gradient(135deg,#eef2ff_0%,#ffffff_46%,#eff6ff_100%)]" />
            <div className="absolute right-[-140px] top-28 hidden w-[720px] rotate-[-3deg] rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-200/60 lg:block">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-24 rounded-full bg-indigo-200" />
                    <div className="mt-3 h-8 w-64 rounded-lg bg-slate-900" />
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-indigo-600 text-white">
                    <LineChart size={22} aria-hidden="true" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-3">
                  {['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map(
                    (color) => (
                      <div
                        key={color}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className={`h-9 w-9 rounded-lg ${color}`} />
                        <div className="mt-4 h-3 rounded-full bg-slate-200" />
                        <div className="mt-2 h-7 w-14 rounded-lg bg-slate-900" />
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-5 rounded-lg border border-slate-200 bg-white">
                  {[
                    ['TCS Digital', 'OA scheduled', 'bg-sky-50 text-sky-800'],
                    ['Deloitte', 'Interview', 'bg-amber-50 text-amber-800'],
                    ['Infosys', 'Selected', 'bg-emerald-50 text-emerald-800'],
                  ].map(([company, status, accent]) => (
                    <div
                      key={company}
                      className="grid grid-cols-[1fr_130px_110px] items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0"
                    >
                      <div>
                        <div className="h-3 w-32 rounded-full bg-slate-900" />
                        <div className="mt-2 h-2 w-24 rounded-full bg-slate-200" />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent}`}>
                        {status}
                      </span>
                      <div className="h-2 rounded-full bg-indigo-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col justify-center px-4 pb-12 sm:px-6 lg:px-8">
            <div className="max-w-2xl py-14 sm:py-20 lg:py-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-800 shadow-sm">
              <LineChart size={16} aria-hidden="true" />
              Placement drive command center
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                Placify
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                A clean placement workspace for students to track drives,
                deadlines, tests, interviews, notes, and next actions without
                losing the thread.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as="link" to="/dashboard">
                  Open Dashboard
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button as="link" to="/email-parser" variant="secondary">
                  Try Email Parser
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/70"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
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

        <section className="bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-indigo-700">
                Built for placement season
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                Open the dashboard and start organizing today.
              </h2>
            </div>
            <Button as="link" to="/add-drive">
              Add Your First Drive
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
