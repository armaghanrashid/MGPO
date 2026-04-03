export type Language = 'en' | 'fr'
export type PlanTierId = 'community' | 'momentum' | 'network'
export type ApplicationStage =
  | 'received'
  | 'review'
  | 'interview'
  | 'training'
  | 'active'
export type DemoPanel =
  | 'dashboard'
  | 'pipeline'
  | 'profiles'
  | 'training'
  | 'matching'
  | 'interviews'
  | 'alerts'
export type AvailabilitySlot = 'weekdays' | 'evenings' | 'weekends' | 'flexible'
export type InterestTag =
  | 'patient-support'
  | 'events'
  | 'food-security'
  | 'mentoring'
  | 'admin'
  | 'outreach'
export type RequirementTag =
  | 'standing'
  | 'lifting'
  | 'bilingual'
  | 'indoor'
  | 'outdoor'
export type MatchStatus = 'suggested' | 'emailed' | 'responded' | 'booked'
export type AlertStatus = 'open' | 'sent' | 'resolved'
export type SeverityLevel = 'low' | 'medium' | 'high'
export type ApplicationSource =
  | 'website'
  | 'cabm'
  | 'mcgill'
  | 'referral'
  | 'ciuss'

export interface LocalizedString {
  en: string
  fr: string
}

export interface ContactInfo {
  name: string
  role: string
  phone: string
  email: string
}

export interface TimelineEvent {
  id: string
  type: 'application' | 'interview' | 'orientation' | 'reference' | 'training'
  date: string
  title: LocalizedString
  detail: LocalizedString
}

export interface Application {
  id: string
  volunteerId: string
  roleId: string
  source: ApplicationSource
  stage: ApplicationStage
  note: LocalizedString
  submittedAt: string
  lastUpdated: string
  timeline: TimelineEvent[]
}

export interface VolunteerProfile {
  id: string
  firstName: string
  lastName: string
  status: 'applicant' | 'active' | 'alumni'
  organization: string
  location: string
  availability: AvailabilitySlot[]
  interests: InterestTag[]
  experience: LocalizedString
  physicalRequirements: RequirementTag[]
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL'
  dietaryRestrictions: string
  languages: string[]
  joinedAt: string
  notes: LocalizedString
  supervisor: ContactInfo
  facilitySupervisor: ContactInfo
  managerOnCall: ContactInfo
}

export interface Role {
  id: string
  title: LocalizedString
  organization: string
  location: string
  premium: boolean
  openings: number
  shiftPattern: LocalizedString
  description: LocalizedString
  interestTags: InterestTag[]
  requirementTags: RequirementTag[]
}

export interface MatchRecommendation {
  id: string
  roleId: string
  volunteerId: string
  score: number
  revealed: boolean
  status: MatchStatus
  rationale: LocalizedString
  emailTemplateId: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: LocalizedString
  body: LocalizedString
}

export interface TrainingCompletion {
  selectedAnswer: number | null
  completedAt: string | null
}

export interface TrainingModule {
  id: string
  title: LocalizedString
  summary: LocalizedString
  lengthMinutes: number
  question: LocalizedString
  options: LocalizedString[]
  correctAnswer: number
  assignedVolunteerIds: string[]
  completionByVolunteer: Record<string, TrainingCompletion>
}

export interface InterviewSlot {
  id: string
  roleId: string
  start: string
  end: string
  interviewer: string
  meetingMode: 'virtual' | 'onsite'
  location: LocalizedString
  bookedVolunteerId: string | null
}

export interface Alert {
  id: string
  volunteerId: string
  deadline: string
  status: AlertStatus
  title: LocalizedString
  detail: LocalizedString
}

export interface TimesheetEntry {
  id: string
  volunteerId: string
  date: string
  hours: number
  rating: number
  feedback: LocalizedString
}

export interface IncidentReport {
  id: string
  volunteerId: string
  date: string
  severity: SeverityLevel
  description: LocalizedString
  resolved: boolean
}

export interface PlanTier {
  id: PlanTierId
  name: LocalizedString
  strapline: LocalizedString
  priceCad: number
  volunteerCap: number | 'unlimited'
  adminCap: number | 'unlimited'
  smartMatchCap: number | 'unlimited'
  features: LocalizedString[]
}

export interface AppState {
  currentPlanId: PlanTierId
  volunteers: VolunteerProfile[]
  applications: Application[]
  roles: Role[]
  matches: MatchRecommendation[]
  emailTemplates: EmailTemplate[]
  trainings: TrainingModule[]
  interviews: InterviewSlot[]
  alerts: Alert[]
  timesheets: TimesheetEntry[]
  incidents: IncidentReport[]
  smartMatchUsage: number
}
