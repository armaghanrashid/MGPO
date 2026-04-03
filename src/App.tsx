import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import './App.css'
import { dictionary, localized } from './i18n'
import { cloneSeedState, planTiers } from './seed'
import type {
  Alert,
  AppState,
  Application,
  ApplicationStage,
  ContactInfo,
  DemoPanel,
  IncidentReport,
  InterviewSlot,
  Language,
  LocalizedString,
  MatchRecommendation,
  PlanTierId,
  TimesheetEntry,
  TrainingModule,
  VolunteerProfile,
} from './types'

const STATE_STORAGE_KEY = 'voluntreal-state'
const LANGUAGE_STORAGE_KEY = 'voluntreal-language'
const DEMO_TODAY = '2026-04-02'
const panelOrder: DemoPanel[] = [
  'dashboard',
  'pipeline',
  'profiles',
  'training',
  'matching',
  'interviews',
  'alerts',
]
const stageOrder: ApplicationStage[] = [
  'received',
  'review',
  'interview',
  'training',
  'active',
]
const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL'] as const

type Route =
  | { page: 'home' }
  | { page: 'pricing' }
  | { page: 'demo' }
  | { page: 'volunteer'; volunteerId: string }

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function parseRoute(pathname: string): Route {
  if (pathname === '/pricing') {
    return { page: 'pricing' }
  }

  if (pathname === '/demo') {
    return { page: 'demo' }
  }

  if (pathname.startsWith('/demo/volunteer/')) {
    const volunteerId = pathname.replace('/demo/volunteer/', '')
    return volunteerId ? { page: 'volunteer', volunteerId } : { page: 'demo' }
  }

  return { page: 'home' }
}

function text(language: Language, value: LocalizedString) {
  return value[language]
}

function formatCurrency(language: Language, amount: number) {
  return new Intl.NumberFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(language: Language, value: string) {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatDateTime(language: Language, value: string) {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getVolunteerName(volunteer: VolunteerProfile) {
  return `${volunteer.firstName} ${volunteer.lastName}`
}

function getVolunteerById(state: AppState, volunteerId: string) {
  return state.volunteers.find((volunteer) => volunteer.id === volunteerId)
}

function getRoleById(state: AppState, roleId: string) {
  return state.roles.find((role) => role.id === roleId)
}

function getApplicationByVolunteerId(state: AppState, volunteerId: string) {
  return state.applications.find((application) => application.volunteerId === volunteerId)
}

function getPlan(planId: PlanTierId) {
  return planTiers.find((plan) => plan.id === planId) ?? planTiers[0]
}

function isFeatureEnabled(
  planId: PlanTierId,
  feature: 'training' | 'matching' | 'interviews' | 'reminders' | 'incidents',
) {
  if (feature === 'incidents') {
    return planId === 'network'
  }

  return planId !== 'community'
}

function profileCompleteness(volunteer: VolunteerProfile) {
  const checks = [
    volunteer.availability.length > 0,
    volunteer.interests.length > 0,
    volunteer.physicalRequirements.length > 0,
    volunteer.dietaryRestrictions.trim().length > 0,
    volunteer.tshirtSize.length > 0,
    volunteer.notes.en.trim().length > 0,
    volunteer.languages.length > 0,
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function buildStageEvent(stage: ApplicationStage): LocalizedString {
  switch (stage) {
    case 'review':
      return localized(
        'Application moved into coordinator review.',
        'La candidature est passee en evaluation par le coordonnateur.',
      )
    case 'interview':
      return localized(
        'Interview planning started from the centralized workflow.',
        'La planification d entrevue a commence depuis le flux centralise.',
      )
    case 'training':
      return localized(
        'Volunteer was moved into the training and orientation sequence.',
        'Le benevole a ete place dans la sequence de formation et d orientation.',
      )
    case 'active':
      return localized(
        'Volunteer is now active and visible in the main roster.',
        'Le benevole est maintenant actif et visible dans le repertoire principal.',
      )
    case 'received':
    default:
      return localized(
        'The application was created in the centralized pipeline.',
        'La candidature a ete creee dans le pipeline centralise.',
      )
  }
}

function getTimelineEventType(stage: ApplicationStage) {
  if (stage === 'interview') {
    return 'interview' as const
  }

  if (stage === 'training' || stage === 'active') {
    return 'training' as const
  }

  return 'application' as const
}

function getSortedTimeline(application?: Application) {
  if (!application) {
    return []
  }

  return [...application.timeline].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  )
}

function App() {
  const [language, setLanguage] = usePersistentState<Language>(LANGUAGE_STORAGE_KEY, 'en')
  const [appState, setAppState] = usePersistentState<AppState>(STATE_STORAGE_KEY, cloneSeedState())
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname))
  const [activePanel, setActivePanel] = useState<DemoPanel>('dashboard')
  const content = dictionary[language]

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const totalHours = appState.timesheets.reduce((sum, entry) => sum + entry.hours, 0)
  const activeVolunteers = appState.volunteers.filter((volunteer) => volunteer.status === 'active').length
  const engagedActiveVolunteers = new Set(
    appState.timesheets
      .filter((entry) => {
        const volunteer = getVolunteerById(appState, entry.volunteerId)
        return volunteer?.status === 'active'
      })
      .map((entry) => entry.volunteerId),
  ).size
  const retentionProxy = activeVolunteers
    ? Math.round((engagedActiveVolunteers / activeVolunteers) * 100)
    : 0
  const averageRating = appState.timesheets.length
    ? (
        appState.timesheets.reduce((sum, entry) => sum + entry.rating, 0) /
        appState.timesheets.length
      ).toFixed(1)
    : '0.0'
  const trainingsCompleted = appState.trainings.reduce(
    (sum, module) =>
      sum +
      Object.values(module.completionByVolunteer).filter((completion) => completion.completedAt).length,
    0,
  )
  const unlockedMatches = appState.matches.filter((match) => match.revealed).length
  const emailsSent = appState.matches.filter((match) =>
    ['emailed', 'responded', 'booked'].includes(match.status),
  ).length
  const responses = appState.matches.filter((match) =>
    ['responded', 'booked'].includes(match.status),
  ).length
  const interviewsBooked = appState.interviews.filter((slot) => slot.bookedVolunteerId).length

  const navigate = (path: string, panel?: DemoPanel) => {
    if (panel) {
      setActivePanel(panel)
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
      setRoute(parseRoute(path))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setRoute(parseRoute(path))
  }

  const updatePlan = (planId: PlanTierId) => {
    setAppState((previous) => ({
      ...previous,
      currentPlanId: planId,
    }))
  }

  const resetDemo = () => {
    setAppState(cloneSeedState())
    setActivePanel('dashboard')
  }

  const updateApplicationStage = (applicationId: string, stage: ApplicationStage) => {
    setAppState((previous) => {
      const application = previous.applications.find((entry) => entry.id === applicationId)

      if (!application || application.stage === stage) {
        return previous
      }

      const updatedApplications = previous.applications.map((entry) => {
        if (entry.id !== applicationId) {
          return entry
        }

        return {
          ...entry,
          stage,
          lastUpdated: DEMO_TODAY,
          timeline: [
            ...entry.timeline,
            {
              id: `timeline-${applicationId}-${stage}-${Date.now()}`,
              type: getTimelineEventType(stage),
              date: DEMO_TODAY,
              title: localized(content.labels.stages[stage], dictionary.fr.labels.stages[stage]),
              detail: buildStageEvent(stage),
            },
          ],
        }
      })

      const updatedVolunteers: VolunteerProfile[] =
        stage === 'active'
          ? previous.volunteers.map((volunteer) =>
              volunteer.id === application.volunteerId
                ? { ...volunteer, status: 'active' as const }
                : volunteer,
            )
          : previous.volunteers

      return {
        ...previous,
        applications: updatedApplications,
        volunteers: updatedVolunteers,
      }
    })
  }

  const updateVolunteerProfile = (
    volunteerId: string,
    changes: Pick<VolunteerProfile, 'availability' | 'tshirtSize' | 'dietaryRestrictions' | 'notes'>,
  ) => {
    setAppState((previous) => ({
      ...previous,
      volunteers: previous.volunteers.map((volunteer) =>
        volunteer.id === volunteerId
          ? {
              ...volunteer,
              availability: changes.availability,
              tshirtSize: changes.tshirtSize,
              dietaryRestrictions: changes.dietaryRestrictions,
              notes: changes.notes,
            }
          : volunteer,
      ),
    }))
  }

  const completeTraining = (moduleId: string, volunteerId: string, answer: number) => {
    setAppState((previous) => ({
      ...previous,
      trainings: previous.trainings.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              completionByVolunteer: {
                ...module.completionByVolunteer,
                [volunteerId]: {
                  selectedAnswer: answer,
                  completedAt: answer === module.correctAnswer ? DEMO_TODAY : null,
                },
              },
            }
          : module,
      ),
    }))
  }

  const unlockShortlist = (roleId: string) => {
    setAppState((previous) => {
      if (!isFeatureEnabled(previous.currentPlanId, 'matching')) {
        return previous
      }

      const plan = getPlan(previous.currentPlanId)
      const cap =
        plan.smartMatchCap === 'unlimited' ? Number.POSITIVE_INFINITY : plan.smartMatchCap
      const remaining = cap - previous.smartMatchUsage

      if (remaining <= 0) {
        return previous
      }

      const candidates = previous.matches
        .filter((match) => match.roleId === roleId && !match.revealed)
        .slice(0, Math.min(2, remaining))

      if (candidates.length === 0) {
        return previous
      }

      const candidateIds = new Set(candidates.map((match) => match.id))

      return {
        ...previous,
        smartMatchUsage: previous.smartMatchUsage + candidates.length,
        matches: previous.matches.map((match) =>
          candidateIds.has(match.id) ? { ...match, revealed: true } : match,
        ),
      }
    })
  }

  const updateMatchStatus = (matchId: string, status: MatchRecommendation['status']) => {
    setAppState((previous) => ({
      ...previous,
      matches: previous.matches.map((match) =>
        match.id === matchId ? { ...match, status } : match,
      ),
    }))
  }

  const scheduleInterview = (slotId: string, volunteerId: string) => {
    setAppState((previous) => {
      if (!isFeatureEnabled(previous.currentPlanId, 'interviews')) {
        return previous
      }

      const slot = previous.interviews.find((interview) => interview.id === slotId)
      const application = previous.applications.find((entry) => entry.volunteerId === volunteerId)

      if (!slot || slot.bookedVolunteerId || !application) {
        return previous
      }

      return {
        ...previous,
        interviews: previous.interviews.map((interview) =>
          interview.id === slotId
            ? { ...interview, bookedVolunteerId: volunteerId }
            : interview,
        ),
        applications: previous.applications.map((entry) =>
          entry.volunteerId === volunteerId
            ? {
                ...entry,
                stage: 'interview',
                lastUpdated: DEMO_TODAY,
                timeline: [
                  ...entry.timeline,
                  {
                    id: `timeline-${entry.id}-slot-${slotId}`,
                    type: 'interview',
                    date: DEMO_TODAY,
                    title: localized('Interview booked', 'Entrevue reservee'),
                    detail: localized(
                      'Booked from the interview hub using a suggested coordinator timeslot.',
                      'Reservee depuis le hub des entrevues avec une plage suggeree par le coordonnateur.',
                    ),
                  },
                ],
              }
            : entry,
        ),
        matches: previous.matches.map((match) =>
          match.volunteerId === volunteerId ? { ...match, status: 'booked', revealed: true } : match,
        ),
      }
    })
  }

  const updateAlertStatus = (alertId: string, status: Alert['status']) => {
    setAppState((previous) => ({
      ...previous,
      alerts: previous.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, status } : alert,
      ),
    }))
  }

  const addTimesheetEntry = (
    volunteerId: string,
    payload: Pick<TimesheetEntry, 'date' | 'hours' | 'rating' | 'feedback'>,
  ) => {
    setAppState((previous) => ({
      ...previous,
      timesheets: [
        {
          id: `timesheet-${Date.now()}`,
          volunteerId,
          date: payload.date,
          hours: payload.hours,
          rating: payload.rating,
          feedback: payload.feedback,
        },
        ...previous.timesheets,
      ],
    }))
  }

  const addIncidentReport = (
    volunteerId: string,
    payload: Pick<IncidentReport, 'date' | 'severity' | 'description'>,
  ) => {
    setAppState((previous) => {
      if (!isFeatureEnabled(previous.currentPlanId, 'incidents')) {
        return previous
      }

      return {
        ...previous,
        incidents: [
          {
            id: `incident-${Date.now()}`,
            volunteerId,
            date: payload.date,
            severity: payload.severity,
            description: payload.description,
            resolved: false,
          },
          ...previous.incidents,
        ],
      }
    })
  }

  const renderPage = () => {
    if (route.page === 'pricing') {
      return (
        <PricingPage
          language={language}
          onNavigate={navigate}
          onChoosePlan={updatePlan}
          currentPlanId={appState.currentPlanId}
        />
      )
    }

    if (route.page === 'demo') {
      return (
        <DemoPage
          language={language}
          appState={appState}
          activePanel={activePanel}
          currentPlanId={appState.currentPlanId}
          onPanelChange={setActivePanel}
          onNavigate={navigate}
          onReset={resetDemo}
          onPlanChange={updatePlan}
          onApplicationStageChange={updateApplicationStage}
          onCompleteTraining={completeTraining}
          onUnlockShortlist={unlockShortlist}
          onUpdateMatchStatus={updateMatchStatus}
          onScheduleInterview={scheduleInterview}
          onUpdateAlertStatus={updateAlertStatus}
          metrics={{
            totalHours,
            retentionProxy,
            averageRating,
            activeVolunteers,
            applications: appState.applications.length,
            matches: unlockedMatches,
            trainingsCompleted,
            interviewsBooked,
            emailsSent,
            responses,
          }}
        />
      )
    }

    if (route.page === 'volunteer') {
      const volunteer = getVolunteerById(appState, route.volunteerId)

      if (!volunteer) {
        return (
          <section className="page-section">
            <div className="not-found">
              <span className="eyebrow">{content.demo.volunteer.breadcrumb}</span>
              <h1>Volunteer not found</h1>
              <p>The requested volunteer profile is not in the demo dataset.</p>
              <button className="button primary" onClick={() => navigate('/demo', 'profiles')}>
                {content.ctas.backToDemo}
              </button>
            </div>
          </section>
        )
      }

      return (
        <VolunteerPage
          language={language}
          volunteer={volunteer}
          application={getApplicationByVolunteerId(appState, volunteer.id)}
          trainings={appState.trainings}
          incidents={appState.incidents.filter((incident) => incident.volunteerId === volunteer.id)}
          timesheets={appState.timesheets.filter((entry) => entry.volunteerId === volunteer.id)}
          currentPlanId={appState.currentPlanId}
          onNavigate={navigate}
          onSaveProfile={updateVolunteerProfile}
          onAddTimesheet={addTimesheetEntry}
          onAddIncident={addIncidentReport}
        />
      )
    }

    return <HomePage language={language} onNavigate={navigate} />
  }

  return (
    <div className="app-shell">
      <TopNav
        language={language}
        onNavigate={navigate}
        onToggleLanguage={() => setLanguage((current) => (current === 'en' ? 'fr' : 'en'))}
        route={route.page}
      />
      {renderPage()}
      <footer className="site-footer">
        <div>
          <strong>{content.appName}</strong>
          <p>{content.ctas.launchMontreal}</p>
        </div>
        <div className="footer-actions">
          <button className="button ghost" onClick={() => navigate('/pricing')}>
            {content.nav.pricing}
          </button>
          <button className="button primary" onClick={() => navigate('/demo')}>
            {content.nav.demo}
          </button>
        </div>
      </footer>
    </div>
  )
}

function TopNav({
  language,
  onNavigate,
  onToggleLanguage,
  route,
}: {
  language: Language
  onNavigate: (path: string, panel?: DemoPanel) => void
  onToggleLanguage: () => void
  route: Route['page']
}) {
  const content = dictionary[language]

  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('/')}>
        <span className="brand-mark">V</span>
        <span>
          <strong>{content.appName}</strong>
          <small>{content.ctas.launchMontreal}</small>
        </span>
      </button>
      <nav className="topnav-links">
        <NavLink active={route === 'home'} href="/" label={content.nav.home} onNavigate={onNavigate} />
        <NavLink
          active={route === 'pricing'}
          href="/pricing"
          label={content.nav.pricing}
          onNavigate={onNavigate}
        />
        <NavLink active={route === 'demo' || route === 'volunteer'} href="/demo" label={content.nav.demo} onNavigate={onNavigate} />
      </nav>
      <button className="language-toggle" onClick={onToggleLanguage}>
        {content.nav.bilingual}
        <span>{language === 'en' ? 'FR' : 'EN'}</span>
      </button>
    </header>
  )
}

function NavLink({
  active,
  href,
  label,
  onNavigate,
}: {
  active: boolean
  href: string
  label: string
  onNavigate: (path: string) => void
}) {
  return (
    <a
      className={`nav-link${active ? ' is-active' : ''}`}
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(href)
      }}
    >
      {label}
    </a>
  )
}

function HomePage({
  language,
  onNavigate,
}: {
  language: Language
  onNavigate: (path: string, panel?: DemoPanel) => void
}) {
  const content = dictionary[language]

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">{content.home.eyebrow}</span>
          <h1>{content.home.title}</h1>
          <p>{content.home.subtitle}</p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => onNavigate('/demo')}>
              {content.ctas.seeDemo}
            </button>
            <button className="button ghost" onClick={() => onNavigate('/pricing')}>
              {content.ctas.viewPricing}
            </button>
          </div>
          <div className="hero-proof-grid">
            <div className="proof-card">
              <span>{content.home.proofLabel}</span>
              <strong>{content.home.proofValue}</strong>
            </div>
            <div className="proof-card">
              <span>{content.home.storyLabel}</span>
              <strong>{content.home.storyValue}</strong>
            </div>
          </div>
        </div>
        <div className="hero-dashboard">
          <div className="hero-window">
            <div className="hero-window-header">
              <span>Voluntreal / Montreal HQ</span>
              <span>EN / FR</span>
            </div>
            <div className="hero-kpi-grid">
              {content.home.heroCards.map((card) => (
                <article className="hero-kpi-card" key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.note}</p>
                </article>
              ))}
            </div>
            <div className="hero-mini-panel">
              <div>
                <span>Pipeline</span>
                <strong>Received / Review / Interview / Active</strong>
              </div>
              <div>
                <span>Premium unlock</span>
                <strong>Matching, interviews, reminders</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <span className="eyebrow">{content.home.featureTitle}</span>
          <h2>{content.home.featureSubtitle}</h2>
        </div>
        <div className="feature-grid">
          {content.home.featureCards.map((card) => (
            <article className="feature-card" key={card.kicker}>
              <span className="feature-kicker">{card.kicker}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section callout-section">
        <div className="callout-card">
          <div className="callout-copy">
            <span className="eyebrow">{content.home.whyTitle}</span>
            <div className="callout-list">
              {content.home.whyBullets.map((bullet) => (
                <p key={bullet}>{bullet}</p>
              ))}
            </div>
          </div>
          <div className="callout-proof">
            <h3>{content.home.launchTitle}</h3>
            <p>{content.home.launchBody}</p>
            <button className="button primary" onClick={() => onNavigate('/demo')}>
              {content.nav.demo}
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="differentiator-grid">
          {content.home.differentiators.map((item) => (
            <article className="differentiator-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PricingPage({
  language,
  onNavigate,
  onChoosePlan,
  currentPlanId,
}: {
  language: Language
  onNavigate: (path: string) => void
  onChoosePlan: (planId: PlanTierId) => void
  currentPlanId: PlanTierId
}) {
  const content = dictionary[language]

  return (
    <main>
      <section className="page-section pricing-hero">
        <span className="eyebrow">{content.pricing.eyebrow}</span>
        <h1>{content.pricing.title}</h1>
        <p>{content.pricing.subtitle}</p>
      </section>

      <section className="page-section">
        <div className="pricing-grid">
          {planTiers.map((plan) => {
            const active = plan.id === currentPlanId
            return (
              <article className={`pricing-card${active ? ' is-featured' : ''}`} key={plan.id}>
                <span className="pricing-name">{text(language, plan.name)}</span>
                <strong className="pricing-price">
                  {plan.priceCad === 0 ? '$0' : formatCurrency(language, plan.priceCad)}
                  <small> CAD / month</small>
                </strong>
                <p>{text(language, plan.strapline)}</p>
                <div className="pricing-meta">
                  <span>
                    {plan.volunteerCap === 'unlimited' ? 'Unlimited volunteers' : `${plan.volunteerCap} volunteers`}
                  </span>
                  <span>
                    {plan.smartMatchCap === 'unlimited'
                      ? 'Unlimited smart matches'
                      : `${plan.smartMatchCap} smart matches`}
                  </span>
                </div>
                <ul className="pricing-list">
                  {plan.features.map((feature) => (
                    <li key={feature.en}>{text(language, feature)}</li>
                  ))}
                </ul>
                <button
                  className={`button${active ? ' ghost' : ' primary'}`}
                  onClick={() => {
                    onChoosePlan(plan.id)
                    onNavigate('/demo')
                  }}
                >
                  {active ? content.ctas.seeDemo : content.ctas.reviewPricing}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="page-section pricing-layout">
        <article className="comparison-card">
          <h2>{content.pricing.compareTitle}</h2>
          <div className="comparison-table">
            <div className="comparison-head">
              <span>Feature</span>
              <span>Community</span>
              <span>Momentum</span>
              <span>Network</span>
            </div>
            {content.pricing.compareRows.map((row) => (
              <div className="comparison-row" key={row.label}>
                <span>{row.label}</span>
                <span>{row.community}</span>
                <span>{row.momentum}</span>
                <span>{row.network}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="add-on-card">
          <h2>{content.pricing.addOnsTitle}</h2>
          <div className="add-on-list">
            {content.pricing.addOns.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <button className="button primary" onClick={() => onNavigate('/demo')}>
            {content.ctas.seeDemo}
          </button>
        </article>
      </section>
    </main>
  )
}

function DemoPage({
  language,
  appState,
  activePanel,
  currentPlanId,
  onPanelChange,
  onNavigate,
  onReset,
  onPlanChange,
  onApplicationStageChange,
  onCompleteTraining,
  onUnlockShortlist,
  onUpdateMatchStatus,
  onScheduleInterview,
  onUpdateAlertStatus,
  metrics,
}: {
  language: Language
  appState: AppState
  activePanel: DemoPanel
  currentPlanId: PlanTierId
  onPanelChange: (panel: DemoPanel) => void
  onNavigate: (path: string, panel?: DemoPanel) => void
  onReset: () => void
  onPlanChange: (planId: PlanTierId) => void
  onApplicationStageChange: (applicationId: string, stage: ApplicationStage) => void
  onCompleteTraining: (moduleId: string, volunteerId: string, answer: number) => void
  onUnlockShortlist: (roleId: string) => void
  onUpdateMatchStatus: (matchId: string, status: MatchRecommendation['status']) => void
  onScheduleInterview: (slotId: string, volunteerId: string) => void
  onUpdateAlertStatus: (alertId: string, status: Alert['status']) => void
  metrics: {
    totalHours: number
    retentionProxy: number
    averageRating: string
    activeVolunteers: number
    applications: number
    matches: number
    trainingsCompleted: number
    interviewsBooked: number
    emailsSent: number
    responses: number
  }
}) {
  const content = dictionary[language]
  const currentPlan = getPlan(currentPlanId)
  const sourceSummary = Object.entries(content.labels.sources).map(([sourceKey, sourceLabel]) => ({
    label: sourceLabel,
    count: appState.applications.filter((application) => application.source === sourceKey).length,
  }))
  const activeDescription = content.demo.panelDescriptions[activePanel]

  return (
    <main className="demo-layout">
      <aside className="workspace-sidebar">
        <div>
          <span className="eyebrow">{content.demo.workspaceEyebrow}</span>
          <h1>{content.demo.workspaceTitle}</h1>
          <p>{content.demo.workspaceSubtitle}</p>
        </div>
        <div className="workspace-plan-card">
          <label>
            <span>{content.demo.planLabel}</span>
            <select
              value={currentPlanId}
              onChange={(event) => onPlanChange(event.currentTarget.value as PlanTierId)}
            >
              {planTiers.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {text(language, plan.name)}
                </option>
              ))}
            </select>
          </label>
          <strong>{text(language, currentPlan.name)}</strong>
          <p>{text(language, currentPlan.strapline)}</p>
        </div>
        <nav className="workspace-nav">
          {panelOrder.map((panel) => (
            <button
              key={panel}
              className={`workspace-tab${activePanel === panel ? ' is-active' : ''}`}
              onClick={() => onPanelChange(panel)}
            >
              <span>{content.demo.moduleLabel}</span>
              <strong>{capitalizePanelLabel(language, panel)}</strong>
            </button>
          ))}
        </nav>
        <button className="button ghost" onClick={onReset}>
          {content.ctas.resetDemo}
        </button>
      </aside>

      <section className="workspace-main">
        <div className="workspace-header">
          <div>
            <span className="eyebrow">{capitalizePanelLabel(language, activePanel)}</span>
            <h2>{activeDescription}</h2>
          </div>
          <button className="button ghost" onClick={() => onNavigate('/pricing')}>
            {content.nav.pricing}
          </button>
        </div>

        <div className="metric-grid">
          <MetricCard label={content.demo.metrics.hours} value={`${metrics.totalHours.toFixed(1)}h`} tone="green" />
          <MetricCard label={content.demo.metrics.retention} value={`${metrics.retentionProxy}%`} tone="gold" />
          <MetricCard label={content.demo.metrics.satisfaction} value={`${metrics.averageRating} / 5`} tone="salmon" />
          <MetricCard label={content.demo.metrics.activity} value={`${metrics.activeVolunteers}`} tone="teal" />
          <MetricCard label={content.demo.metrics.applications} value={`${metrics.applications}`} tone="slate" />
          <MetricCard label={content.demo.metrics.matches} value={`${metrics.matches}`} tone="gold" />
          <MetricCard label={content.demo.metrics.trainings} value={`${metrics.trainingsCompleted}`} tone="green" />
          <MetricCard label={content.demo.metrics.interviews} value={`${metrics.interviewsBooked}`} tone="salmon" />
        </div>

        {activePanel === 'dashboard' && (
          <div className="panel-stack">
            <PanelCard title={content.demo.metricsTitle} subtitle={content.demo.panelDescriptions.dashboard}>
              <div className="dashboard-detail-grid">
                <div className="chart-card">
                  <h3>{content.demo.pipeline.sourceTitle}</h3>
                  <div className="bar-list">
                    {sourceSummary.map((source) => (
                      <div className="bar-row" key={source.label}>
                        <span>{source.label}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${Math.max(source.count * 22, source.count ? 20 : 6)}%` }}
                          />
                        </div>
                        <strong>{source.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Recruitment funnel</h3>
                  <div className="funnel-list">
                    {stageOrder.map((stage) => (
                      <div className="funnel-row" key={stage}>
                        <span>{content.labels.stages[stage]}</span>
                        <strong>
                          {
                            appState.applications.filter((application) => application.stage === stage).length
                          }
                        </strong>
                      </div>
                    ))}
                  </div>
                  <div className="metric-pair">
                    <span>{content.demo.metrics.emailsSent}</span>
                    <strong>{metrics.emailsSent}</strong>
                  </div>
                  <div className="metric-pair">
                    <span>{content.demo.metrics.responses}</span>
                    <strong>{metrics.responses}</strong>
                  </div>
                </div>
              </div>
            </PanelCard>
          </div>
        )}

        {activePanel === 'pipeline' && (
          <PanelCard title={content.demo.pipeline.sourceTitle} subtitle={content.demo.pipeline.sourceSubtitle}>
            <div className="application-list">
              {appState.applications.map((application) => {
                const volunteer = getVolunteerById(appState, application.volunteerId)
                const role = getRoleById(appState, application.roleId)

                if (!volunteer || !role) {
                  return null
                }

                return (
                  <article className="application-card" key={application.id}>
                    <div className="application-topline">
                      <div>
                        <h3>{getVolunteerName(volunteer)}</h3>
                        <p>
                          {text(language, role.title)} • {content.labels.sources[application.source]}
                        </p>
                      </div>
                      <span className={`status-chip stage-${application.stage}`}>
                        {content.labels.stages[application.stage]}
                      </span>
                    </div>
                    <p>{text(language, application.note)}</p>
                    <div className="application-meta">
                      <span>
                        {content.demo.pipeline.lastUpdated}: {formatDate(language, application.lastUpdated)}
                      </span>
                      <span>{role.organization}</span>
                    </div>
                    <label className="field">
                      <span>{content.demo.pipeline.actionLabel}</span>
                      <select
                        value={application.stage}
                        onChange={(event) =>
                          onApplicationStageChange(
                            application.id,
                            event.currentTarget.value as ApplicationStage,
                          )
                        }
                      >
                        {stageOrder.map((stage) => (
                          <option key={stage} value={stage}>
                            {content.labels.stages[stage]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="timeline-preview">
                      {getSortedTimeline(application)
                        .slice(0, 2)
                        .map((event) => (
                          <div className="timeline-row" key={event.id}>
                            <span>{formatDate(language, event.date)}</span>
                            <strong>{text(language, event.title)}</strong>
                          </div>
                        ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </PanelCard>
        )}

        {activePanel === 'profiles' && (
          <PanelCard title={content.demo.profiles.title} subtitle={content.demo.profiles.subtitle}>
            <div className="profile-grid">
              {appState.volunteers.map((volunteer) => (
                <article className="profile-card" key={volunteer.id}>
                  <div className="profile-topline">
                    <div>
                      <h3>{getVolunteerName(volunteer)}</h3>
                      <p>{volunteer.organization}</p>
                    </div>
                    <span className={`status-chip profile-${volunteer.status}`}>
                      {content.labels.status[volunteer.status]}
                    </span>
                  </div>
                  <div className="tag-row">
                    {volunteer.interests.map((interest) => (
                      <span className="tag" key={interest}>
                        {content.labels.interests[interest]}
                      </span>
                    ))}
                  </div>
                  <p>{text(language, volunteer.experience)}</p>
                  <div className="progress-block">
                    <span>{content.demo.profiles.completeness}</span>
                    <strong>{profileCompleteness(volunteer)}%</strong>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${profileCompleteness(volunteer)}%` }}
                      />
                    </div>
                  </div>
                  <div className="contact-stack">
                    <span>{content.demo.profiles.contacts}</span>
                    <strong>{volunteer.supervisor.name}</strong>
                    <p>{volunteer.supervisor.email}</p>
                  </div>
                  <button
                    className="button ghost"
                    onClick={() => onNavigate(`/demo/volunteer/${volunteer.id}`)}
                  >
                    {content.ctas.openVolunteerPage}
                  </button>
                </article>
              ))}
            </div>
          </PanelCard>
        )}

        {activePanel === 'training' && (
          <FeaturePanel
            enabled={isFeatureEnabled(currentPlanId, 'training')}
            title={content.demo.premiumGateTitle}
            body={content.demo.premiumGateBody}
          >
            <TrainingPanel
              language={language}
              trainings={appState.trainings}
              volunteers={appState.volunteers}
              onCompleteTraining={onCompleteTraining}
            />
          </FeaturePanel>
        )}

        {activePanel === 'matching' && (
          <FeaturePanel
            enabled={isFeatureEnabled(currentPlanId, 'matching')}
            title={content.demo.premiumGateTitle}
            body={content.demo.premiumGateBody}
          >
            <MatchingPanel
              language={language}
              appState={appState}
              onUnlockShortlist={onUnlockShortlist}
              onUpdateMatchStatus={onUpdateMatchStatus}
            />
          </FeaturePanel>
        )}

        {activePanel === 'interviews' && (
          <FeaturePanel
            enabled={isFeatureEnabled(currentPlanId, 'interviews')}
            title={content.demo.premiumGateTitle}
            body={content.demo.premiumGateBody}
          >
            <InterviewsPanel
              language={language}
              state={appState}
              onScheduleInterview={onScheduleInterview}
            />
          </FeaturePanel>
        )}

        {activePanel === 'alerts' && (
          <AlertsPanel
            language={language}
            alerts={appState.alerts}
            volunteers={appState.volunteers}
            remindersEnabled={isFeatureEnabled(currentPlanId, 'reminders')}
            onUpdateAlertStatus={onUpdateAlertStatus}
          />
        )}
      </section>
    </main>
  )
}

function VolunteerPage({
  language,
  volunteer,
  application,
  trainings,
  incidents,
  timesheets,
  currentPlanId,
  onNavigate,
  onSaveProfile,
  onAddTimesheet,
  onAddIncident,
}: {
  language: Language
  volunteer: VolunteerProfile
  application?: Application
  trainings: TrainingModule[]
  incidents: IncidentReport[]
  timesheets: TimesheetEntry[]
  currentPlanId: PlanTierId
  onNavigate: (path: string, panel?: DemoPanel) => void
  onSaveProfile: (
    volunteerId: string,
    changes: Pick<VolunteerProfile, 'availability' | 'tshirtSize' | 'dietaryRestrictions' | 'notes'>,
  ) => void
  onAddTimesheet: (
    volunteerId: string,
    payload: Pick<TimesheetEntry, 'date' | 'hours' | 'rating' | 'feedback'>,
  ) => void
  onAddIncident: (
    volunteerId: string,
    payload: Pick<IncidentReport, 'date' | 'severity' | 'description'>,
  ) => void
}) {
  const content = dictionary[language]
  const [availability, setAvailability] = useState(volunteer.availability)
  const [tshirtSize, setTshirtSize] = useState(volunteer.tshirtSize)
  const [dietaryRestrictions, setDietaryRestrictions] = useState(volunteer.dietaryRestrictions)
  const [notes, setNotes] = useState(text(language, volunteer.notes))
  const [entryDate, setEntryDate] = useState(DEMO_TODAY)
  const [entryHours, setEntryHours] = useState('3')
  const [entryRating, setEntryRating] = useState('5')
  const [entryFeedback, setEntryFeedback] = useState('')
  const [incidentDate, setIncidentDate] = useState(DEMO_TODAY)
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentReport['severity']>('low')
  const [incidentDescription, setIncidentDescription] = useState('')

  useEffect(() => {
    setAvailability(volunteer.availability)
    setTshirtSize(volunteer.tshirtSize)
    setDietaryRestrictions(volunteer.dietaryRestrictions)
    setNotes(text(language, volunteer.notes))
  }, [language, volunteer])

  const assignedTrainings = trainings.filter((module) =>
    module.assignedVolunteerIds.includes(volunteer.id),
  )
  const timeline = getSortedTimeline(application)

  const toggleAvailability = (value: VolunteerProfile['availability'][number]) => {
    setAvailability((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    )
  }

  return (
    <main>
      <section className="page-section volunteer-hero">
        <button className="button ghost" onClick={() => onNavigate('/demo', 'profiles')}>
          {content.ctas.backToDemo}
        </button>
        <div className="volunteer-hero-card">
          <div>
            <span className="eyebrow">{content.demo.volunteer.breadcrumb}</span>
            <h1>{getVolunteerName(volunteer)}</h1>
            <p>
              {volunteer.organization} • {volunteer.location}
            </p>
          </div>
          <div className="volunteer-hero-badges">
            <span className={`status-chip profile-${volunteer.status}`}>
              {content.labels.status[volunteer.status]}
            </span>
            <span className="tag">{volunteer.languages.join(' / ')}</span>
          </div>
        </div>
      </section>

      <section className="page-section volunteer-layout">
        <div className="volunteer-main">
          <PanelCard
            title={content.demo.volunteer.profileTitle}
            subtitle={content.demo.volunteer.profileSubtitle}
          >
            <div className="field-grid two-column">
              <label className="field">
                <span>{content.demo.volunteer.fields.tshirt}</span>
                <select
                  value={tshirtSize}
                  onChange={(event) =>
                    setTshirtSize(event.currentTarget.value as VolunteerProfile['tshirtSize'])
                  }
                >
                  {tshirtSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{content.demo.volunteer.fields.dietary}</span>
                <input
                  value={dietaryRestrictions}
                  onChange={(event) => setDietaryRestrictions(event.currentTarget.value)}
                />
              </label>
            </div>

            <div className="field">
              <span>{content.demo.volunteer.fields.availability}</span>
              <div className="checkbox-row">
                {Object.entries(content.labels.availability).map(([value, label]) => (
                  <label className="checkbox-card" key={value}>
                    <input
                      checked={availability.includes(value as VolunteerProfile['availability'][number])}
                      type="checkbox"
                      onChange={() =>
                        toggleAvailability(value as VolunteerProfile['availability'][number])
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="field">
              <span>{content.demo.volunteer.fields.notes}</span>
              <textarea value={notes} onChange={(event) => setNotes(event.currentTarget.value)} />
            </label>

            <button
              className="button primary"
              onClick={() =>
                onSaveProfile(volunteer.id, {
                  availability,
                  tshirtSize,
                  dietaryRestrictions,
                  notes: localized(notes, notes),
                })
              }
            >
              {content.demo.volunteer.saveProfile}
            </button>
          </PanelCard>

          <PanelCard
            title={content.demo.volunteer.timesheetTitle}
            subtitle={content.demo.volunteer.timesheetSubtitle}
          >
            <div className="field-grid three-column">
              <label className="field">
                <span>{content.demo.volunteer.fields.date}</span>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) => setEntryDate(event.currentTarget.value)}
                />
              </label>
              <label className="field">
                <span>{content.demo.volunteer.fields.hours}</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={entryHours}
                  onChange={(event) => setEntryHours(event.currentTarget.value)}
                />
              </label>
              <label className="field">
                <span>{content.demo.volunteer.fields.rating}</span>
                <select
                  value={entryRating}
                  onChange={(event) => setEntryRating(event.currentTarget.value)}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>{content.demo.volunteer.fields.feedback}</span>
              <textarea
                value={entryFeedback}
                onChange={(event) => setEntryFeedback(event.currentTarget.value)}
              />
            </label>

            <button
              className="button primary"
              onClick={() => {
                onAddTimesheet(volunteer.id, {
                  date: entryDate,
                  hours: Number(entryHours),
                  rating: Number(entryRating),
                  feedback: localized(entryFeedback || notes, entryFeedback || notes),
                })
                setEntryFeedback('')
              }}
            >
              {content.demo.volunteer.logHours}
            </button>

            <div className="stack-list">
              {timesheets.map((entry) => (
                <div className="list-row" key={entry.id}>
                  <div>
                    <strong>
                      {formatDate(language, entry.date)} • {entry.hours}h
                    </strong>
                    <p>{text(language, entry.feedback)}</p>
                  </div>
                  <span className="tag">{entry.rating} / 5</span>
                </div>
              ))}
            </div>
          </PanelCard>

          <FeaturePanel
            enabled={isFeatureEnabled(currentPlanId, 'incidents')}
            title={content.demo.networkGateTitle}
            body={content.demo.networkGateBody}
          >
            <PanelCard
              title={content.demo.volunteer.incidentTitle}
              subtitle={content.demo.volunteer.incidentSubtitle}
            >
              <div className="field-grid three-column">
                <label className="field">
                  <span>{content.demo.volunteer.fields.date}</span>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(event) => setIncidentDate(event.currentTarget.value)}
                  />
                </label>
                <label className="field">
                  <span>{content.demo.volunteer.fields.severity}</span>
                  <select
                    value={incidentSeverity}
                    onChange={(event) =>
                      setIncidentSeverity(event.currentTarget.value as IncidentReport['severity'])
                    }
                  >
                    {Object.entries(content.labels.severity).map(([severity, label]) => (
                      <option key={severity} value={severity}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>{content.demo.volunteer.fields.description}</span>
                <textarea
                  value={incidentDescription}
                  onChange={(event) => setIncidentDescription(event.currentTarget.value)}
                />
              </label>
              <button
                className="button primary"
                onClick={() => {
                  onAddIncident(volunteer.id, {
                    date: incidentDate,
                    severity: incidentSeverity,
                    description: localized(incidentDescription, incidentDescription),
                  })
                  setIncidentDescription('')
                }}
              >
                {content.demo.volunteer.fileIncident}
              </button>
              {incidents.length > 0 ? (
                <div className="stack-list">
                  {incidents.map((incident) => (
                    <div className="list-row" key={incident.id}>
                      <div>
                        <strong>
                          {formatDate(language, incident.date)} •{' '}
                          {content.labels.severity[incident.severity]}
                        </strong>
                        <p>{text(language, incident.description)}</p>
                      </div>
                      <span className={`status-chip${incident.resolved ? ' is-neutral' : ''}`}>
                        {incident.resolved ? content.labels.status.resolved : content.labels.status.open}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">{content.demo.volunteer.noIncidents}</p>
              )}
            </PanelCard>
          </FeaturePanel>
        </div>

        <div className="volunteer-side">
          <PanelCard
            title={content.demo.volunteer.contactsTitle}
            subtitle={content.demo.profiles.contacts}
          >
            <ContactCard contact={volunteer.supervisor} />
            <ContactCard contact={volunteer.facilitySupervisor} />
            <ContactCard contact={volunteer.managerOnCall} />
          </PanelCard>

          <PanelCard
            title={content.demo.volunteer.trainingTitle}
            subtitle={`${assignedTrainings.length} assigned modules`}
          >
            {assignedTrainings.map((module) => {
              const completion = module.completionByVolunteer[volunteer.id]
              return (
                <div className="list-row" key={module.id}>
                  <div>
                    <strong>{text(language, module.title)}</strong>
                    <p>{text(language, module.summary)}</p>
                  </div>
                  <span className={`status-chip${completion?.completedAt ? ' is-success' : ''}`}>
                    {completion?.completedAt ? content.demo.training.completed : 'Assigned'}
                  </span>
                </div>
              )
            })}
          </PanelCard>

          <PanelCard
            title={content.demo.volunteer.timelineTitle}
            subtitle={content.demo.volunteer.timelineSubtitle}
          >
            {timeline.length > 0 ? (
              <div className="timeline-list">
                {timeline.map((event) => (
                  <div className="timeline-item" key={event.id}>
                    <span>{formatDate(language, event.date)}</span>
                    <strong>{text(language, event.title)}</strong>
                    <p>{text(language, event.detail)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">{content.demo.volunteer.noTimeline}</p>
            )}
          </PanelCard>
        </div>
      </section>
    </main>
  )
}

function TrainingPanel({
  language,
  trainings,
  volunteers,
  onCompleteTraining,
}: {
  language: Language
  trainings: TrainingModule[]
  volunteers: VolunteerProfile[]
  onCompleteTraining: (moduleId: string, volunteerId: string, answer: number) => void
}) {
  const content = dictionary[language]
  const fallbackVolunteer = trainings[0]?.assignedVolunteerIds[0] ?? volunteers[0]?.id ?? ''
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(fallbackVolunteer)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!selectedVolunteerId && fallbackVolunteer) {
      setSelectedVolunteerId(fallbackVolunteer)
    }
  }, [fallbackVolunteer, selectedVolunteerId])

  return (
    <PanelCard title={content.demo.training.title} subtitle={content.demo.training.subtitle}>
      <label className="field">
        <span>{content.demo.training.chooseVolunteer}</span>
        <select
          value={selectedVolunteerId}
          onChange={(event) => setSelectedVolunteerId(event.currentTarget.value)}
        >
          {volunteers.map((volunteer) => (
            <option key={volunteer.id} value={volunteer.id}>
              {getVolunteerName(volunteer)}
            </option>
          ))}
        </select>
      </label>
      <div className="stack-list">
        {trainings.map((module) => {
          const completion = module.completionByVolunteer[selectedVolunteerId]
          const volunteerIsAssigned = module.assignedVolunteerIds.includes(selectedVolunteerId)

          return (
            <article className="module-card" key={module.id}>
              <div className="module-topline">
                <div>
                  <h3>{text(language, module.title)}</h3>
                  <p>{text(language, module.summary)}</p>
                </div>
                <span className="tag">{module.lengthMinutes} min</span>
              </div>
              <p>
                {content.demo.training.assignedTo}: {module.assignedVolunteerIds.length}
              </p>
              {volunteerIsAssigned ? (
                <>
                  <p className="question-label">{text(language, module.question)}</p>
                  <div className="option-list">
                    {module.options.map((option, index) => (
                      <label className="option-card" key={option.en}>
                        <input
                          type="radio"
                          name={`${module.id}-${selectedVolunteerId}`}
                          checked={(answers[module.id] ?? completion?.selectedAnswer ?? -1) === index}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [module.id]: index,
                            }))
                          }
                        />
                        <span>{text(language, option)}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="button primary"
                    onClick={() =>
                      onCompleteTraining(
                        module.id,
                        selectedVolunteerId,
                        answers[module.id] ?? completion?.selectedAnswer ?? 0,
                      )
                    }
                  >
                    {content.demo.training.submit}
                  </button>
                  <div className="list-row">
                    <span>{content.demo.training.completed}</span>
                    <strong>{completion?.completedAt ? formatDate(language, completion.completedAt) : 'Pending'}</strong>
                  </div>
                </>
              ) : (
                <p className="empty-state">Selected volunteer is not assigned to this module.</p>
              )}
            </article>
          )
        })}
      </div>
    </PanelCard>
  )
}

function MatchingPanel({
  language,
  appState,
  onUnlockShortlist,
  onUpdateMatchStatus,
}: {
  language: Language
  appState: AppState
  onUnlockShortlist: (roleId: string) => void
  onUpdateMatchStatus: (matchId: string, status: MatchRecommendation['status']) => void
}) {
  const content = dictionary[language]
  const plan = getPlan(appState.currentPlanId)
  const cap = plan.smartMatchCap === 'unlimited' ? null : plan.smartMatchCap

  return (
    <PanelCard title={content.demo.matching.title} subtitle={content.demo.matching.subtitle}>
      <div className="usage-card">
        <div>
          <span>{content.demo.matching.usage}</span>
          <strong>
            {appState.smartMatchUsage}
            {cap ? ` / ${cap}` : ' / Unlimited'}
          </strong>
        </div>
        {cap ? (
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((appState.smartMatchUsage / cap) * 100, 100)}%` }}
            />
          </div>
        ) : (
          <p>Network removes monthly shortlist caps.</p>
        )}
      </div>
      <div className="stack-list">
        {appState.roles.map((role) => {
          const matches = appState.matches.filter((match) => match.roleId === role.id)
          const visibleMatches = matches.filter((match) => match.revealed)

          return (
            <article className="role-card" key={role.id}>
              <div className="module-topline">
                <div>
                  <h3>{text(language, role.title)}</h3>
                  <p>{text(language, role.description)}</p>
                </div>
                <span className={`tag${role.premium ? ' tag-premium' : ''}`}>
                  {role.premium ? 'Premium role' : 'Core role'}
                </span>
              </div>
              <div className="tag-row">
                {role.requirementTags.map((requirement) => (
                  <span className="tag" key={requirement}>
                    {content.labels.requirements[requirement]}
                  </span>
                ))}
              </div>
              <button className="button ghost" onClick={() => onUnlockShortlist(role.id)}>
                {content.demo.matching.unlockShortlist}
              </button>
              <div className="stack-list">
                {visibleMatches.length > 0 ? (
                  visibleMatches.map((match) => {
                    const volunteer = getVolunteerById(appState, match.volunteerId)
                    const template = appState.emailTemplates.find(
                      (emailTemplate) => emailTemplate.id === match.emailTemplateId,
                    )

                    if (!volunteer || !template) {
                      return null
                    }

                    return (
                      <div className="match-card" key={match.id}>
                        <div className="list-row">
                          <div>
                            <strong>{getVolunteerName(volunteer)}</strong>
                            <p>{text(language, match.rationale)}</p>
                          </div>
                          <span className="tag">
                            {content.demo.matching.score}: {match.score}
                          </span>
                        </div>
                        <div className="template-card">
                          <span>{content.demo.matching.template}</span>
                          <strong>{text(language, template.subject)}</strong>
                          <p>{text(language, template.body)}</p>
                        </div>
                        <div className="button-row">
                          {match.status === 'suggested' && (
                            <button
                              className="button primary"
                              onClick={() => onUpdateMatchStatus(match.id, 'emailed')}
                            >
                              {content.demo.matching.sendEmail}
                            </button>
                          )}
                          {match.status === 'emailed' && (
                            <button
                              className="button secondary"
                              onClick={() => onUpdateMatchStatus(match.id, 'responded')}
                            >
                              {content.demo.matching.markResponse}
                            </button>
                          )}
                          {match.status !== 'suggested' && (
                            <span className="status-chip is-success">{match.status}</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="empty-state">No shortlist unlocked yet for this role.</p>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </PanelCard>
  )
}

function InterviewsPanel({
  language,
  state,
  onScheduleInterview,
}: {
  language: Language
  state: AppState
  onScheduleInterview: (slotId: string, volunteerId: string) => void
}) {
  const content = dictionary[language]

  return (
    <PanelCard title={content.demo.interviews.title} subtitle={content.demo.interviews.subtitle}>
      <div className="stack-list">
        {state.interviews.map((slot) => (
          <InterviewCard
            key={slot.id}
            language={language}
            slot={slot}
            volunteers={state.volunteers}
            applications={state.applications}
            onScheduleInterview={onScheduleInterview}
          />
        ))}
      </div>
    </PanelCard>
  )
}

function InterviewCard({
  language,
  slot,
  volunteers,
  applications,
  onScheduleInterview,
}: {
  language: Language
  slot: InterviewSlot
  volunteers: VolunteerProfile[]
  applications: Application[]
  onScheduleInterview: (slotId: string, volunteerId: string) => void
}) {
  const content = dictionary[language]
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(
    applications.find((application) => application.roleId === slot.roleId)?.volunteerId ?? '',
  )
  const bookedVolunteer = slot.bookedVolunteerId
    ? volunteers.find((volunteer) => volunteer.id === slot.bookedVolunteerId)
    : null
  const eligibleVolunteers = applications
    .filter((application) => application.roleId === slot.roleId)
    .map((application) => volunteers.find((volunteer) => volunteer.id === application.volunteerId))
    .filter((volunteer): volunteer is VolunteerProfile => Boolean(volunteer))

  return (
    <article className="module-card">
      <div className="module-topline">
        <div>
          <h3>{formatDateTime(language, slot.start)}</h3>
          <p>{text(language, slot.location)}</p>
        </div>
        <span className={`status-chip${bookedVolunteer ? ' is-success' : ''}`}>
          {bookedVolunteer ? content.demo.interviews.booked : content.demo.interviews.available}
        </span>
      </div>
      <div className="metric-pair">
        <span>{slot.interviewer}</span>
        <strong>{slot.meetingMode}</strong>
      </div>
      {bookedVolunteer ? (
        <div className="list-row">
          <div>
            <strong>{getVolunteerName(bookedVolunteer)}</strong>
            <p>{bookedVolunteer.organization}</p>
          </div>
        </div>
      ) : (
        <div className="button-row">
          <label className="field field-inline">
            <span>{content.demo.interviews.volunteerLabel}</span>
            <select
              value={selectedVolunteerId}
              onChange={(event) => setSelectedVolunteerId(event.currentTarget.value)}
            >
              {eligibleVolunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>
                  {getVolunteerName(volunteer)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button primary"
            disabled={!selectedVolunteerId}
            onClick={() => onScheduleInterview(slot.id, selectedVolunteerId)}
          >
            {content.demo.interviews.schedule}
          </button>
        </div>
      )}
    </article>
  )
}

function AlertsPanel({
  language,
  alerts,
  volunteers,
  remindersEnabled,
  onUpdateAlertStatus,
}: {
  language: Language
  alerts: Alert[]
  volunteers: VolunteerProfile[]
  remindersEnabled: boolean
  onUpdateAlertStatus: (alertId: string, status: Alert['status']) => void
}) {
  const content = dictionary[language]

  return (
    <PanelCard title={content.demo.alerts.title} subtitle={content.demo.alerts.subtitle}>
      {!remindersEnabled && (
        <div className="inline-gate">
          <strong>{content.demo.premiumGateTitle}</strong>
          <p>{content.demo.premiumGateBody}</p>
        </div>
      )}
      <div className="stack-list">
        {alerts.map((alert) => {
          const volunteer = volunteers.find((entry) => entry.id === alert.volunteerId)

          return (
            <article className="list-row list-card" key={alert.id}>
              <div>
                <strong>{text(language, alert.title)}</strong>
                <p>{text(language, alert.detail)}</p>
                <small>
                  {volunteer ? getVolunteerName(volunteer) : 'Volunteer'} • {content.demo.alerts.deadline}:{' '}
                  {formatDate(language, alert.deadline)}
                </small>
              </div>
              <div className="button-row compact">
                <span className={`status-chip alert-${alert.status}`}>
                  {content.labels.status[alert.status]}
                </span>
                <button
                  className="button ghost"
                  disabled={!remindersEnabled || alert.status === 'resolved'}
                  onClick={() => onUpdateAlertStatus(alert.id, 'sent')}
                >
                  {content.demo.alerts.sendReminder}
                </button>
                <button
                  className="button secondary"
                  onClick={() => onUpdateAlertStatus(alert.id, 'resolved')}
                >
                  {content.demo.alerts.resolve}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </PanelCard>
  )
}

function FeaturePanel({
  enabled,
  title,
  body,
  children,
}: {
  enabled: boolean
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <div className={`feature-panel${enabled ? '' : ' is-locked'}`}>
      {children}
      {!enabled && (
        <div className="feature-overlay">
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
      )}
    </div>
  )
}

function PanelCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="panel-card">
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'gold' | 'salmon' | 'teal' | 'slate'
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function ContactCard({ contact }: { contact: ContactInfo }) {
  return (
    <div className="contact-card">
      <strong>{contact.name}</strong>
      <p>{contact.role}</p>
      <small>{contact.phone}</small>
      <small>{contact.email}</small>
    </div>
  )
}

function capitalizePanelLabel(language: Language, panel: DemoPanel) {
  const labels: Record<DemoPanel, string> = {
    dashboard: language === 'fr' ? 'Tableau de bord' : 'Dashboard',
    pipeline: language === 'fr' ? 'Pipeline' : 'Pipeline',
    profiles: language === 'fr' ? 'Profils' : 'Profiles',
    training: language === 'fr' ? 'Formation' : 'Training',
    matching: language === 'fr' ? 'Jumelage' : 'Matching',
    interviews: language === 'fr' ? 'Entrevues' : 'Interviews',
    alerts: language === 'fr' ? 'Alertes' : 'Alerts',
  }

  return labels[panel]
}

export default App
