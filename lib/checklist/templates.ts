import { FoundationType, PermitStatus, DrawingType, ChecklistStep } from './types'

const SUCCESS_TEAM_PHONE = '(813) 692-7320'
const SUCCESS_TEAM_EMAIL = 'SuccessTeam@bigbuildingsdirect.com'

// Step 1: Permitting — varies by permitStatus + drawingType
const permitSteps: Record<string, (vars: TemplateVars) => ChecklistStep> = {
  'No Permit': (vars) => ({
    stepNumber: 1,
    title: 'Permitting',
    icon: '📋',
    timelineLabel: 'No action needed',
    action: 'No permit required — move directly to land preparation!',
    bullets: [
      `Based on your project needs, no building permit is required for your structure.`,
      'You can skip ahead and start preparing your land while your building is being fabricated.',
      `If your local jurisdiction contacts you, reach out to ${SUCCESS_TEAM_EMAIL} or call ${SUCCESS_TEAM_PHONE}.`,
    ],
  }),
  'Pulling a Permit|Generic': (vars) => ({
    stepNumber: 1,
    title: 'Permitting — Generic Drawings',
    icon: '📋',
    timelineLabel: 'Weeks 1–2',
    action: 'Submit your permit application as soon as you receive your drawings.',
    bullets: [
      'Your order requires a building permit — we will provide generic engineering drawings.',
      'Generic drawings are pre-engineered for your building size and local wind/snow loads, accepted by most jurisdictions.',
      `Drawings will be emailed to ${vars.customerEmail} within 5–7 business days of fabrication start.`,
      'Processing times vary by county, so submit early!',
    ],
  }),
  'Pulling a Permit|As-Built': (vars) => ({
    stepNumber: 1,
    title: 'Permitting — As-Built Drawings',
    icon: '📐',
    timelineLabel: 'Weeks 1–3',
    action: 'Wait for your finalized as-built drawings before submitting your permit.',
    bullets: [
      'Your order requires site-specific (as-built) engineering drawings for your permit.',
      'These are custom-engineered for your exact site conditions — foundation details, setbacks, and local code requirements.',
      `As-built drawings typically take 10–14 business days and will be emailed to ${vars.customerEmail}.`,
      'Do NOT submit your permit application until you receive the finalized drawings, as they may differ from standard templates.',
    ],
  }),
}

// Step 2: Land Preparation — varies by foundationType
const landPrepSteps: Record<FoundationType, (vars: TemplateVars) => ChecklistStep> = {
  'Concrete': (vars) => ({
    stepNumber: 2,
    title: 'Land Prep — Concrete Foundation',
    icon: '🏗',
    timelineLabel: 'Weeks 2–6',
    action: `Hire a concrete contractor and complete your pad before delivery day.`,
    bullets: [
      'Your building requires a concrete slab or pad foundation — this must be done BEFORE delivery.',
      'Pad must be level (within 1/4" over 10 feet), properly cured (min 7 days, ideally 28), and sized to your building dimensions plus 2" overhang per side.',
      'Share your building dimensions and any engineering drawings with your contractor.',
      `${vars.mfgName} will be the installer for this building project.`,
      `Once your land is ready, email ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
  'Level Ground': (vars) => ({
    stepNumber: 2,
    title: 'Land Prep — Level Ground',
    icon: '🏗',
    timelineLabel: 'Weeks 2–4',
    action: 'Clear and level your site, then notify us when it\'s ready.',
    bullets: [
      'Your building will be installed directly on level ground with earth anchors.',
      'Clear the area of debris, vegetation, and large rocks — ground should be level within 3" across the footprint.',
      'If your site has a slope, a local excavation contractor can typically grade it in 1–2 days.',
      'Ensure at least 14 feet of clearance for delivery trucks.',
      `${vars.mfgName} will be the installer for this building project.`,
      `Once your land is ready, email ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
  'Stem Wall': (vars) => ({
    stepNumber: 2,
    title: 'Land Prep — Stem Wall Foundation',
    icon: '🏗',
    timelineLabel: 'Weeks 2–6',
    action: 'Hire an experienced concrete contractor for your stem wall.',
    bullets: [
      'Your building requires a stem wall (raised perimeter) foundation — plan ahead, this takes time.',
      'Involves pouring a continuous concrete perimeter wall, typically 6–12" above grade, with embedded anchor bolts.',
      'Use a contractor experienced with metal building foundations and share all engineering drawings with them.',
      `${vars.mfgName} will be the installer for this building project.`,
      `Once your land is ready, email ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
  'Mixed': (vars) => ({
    stepNumber: 2,
    title: 'Land Prep — Mixed Foundation',
    icon: '🏗',
    timelineLabel: 'Weeks 2–6',
    action: 'Coordinate concrete work for the slab portion and clear the rest.',
    bullets: [
      'Your building uses a mixed approach — concrete slab for part of the structure and earth anchors for the rest.',
      'Review your engineering drawings carefully for the specific layout.',
      'All concrete work must be completed and cured before your scheduled delivery.',
      `${vars.mfgName} will be the installer for this building project.`,
      `Once your land is ready, email ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
  'Other': (vars) => ({
    stepNumber: 2,
    title: 'Land Prep — Custom Foundation',
    icon: '🏗',
    timelineLabel: 'Weeks 2–6',
    action: `Contact us to confirm your exact foundation requirements.`,
    bullets: [
      'Your building has a custom foundation requirement — review your order details and engineering drawings carefully.',
      'Ensure your site is cleared, level, and accessible for delivery trucks (min 14 feet clearance).',
      'Complete all foundation work at least 2 weeks before delivery for curing and inspections.',
      `${vars.mfgName} will be the installer for this building project.`,
      `Once your land is ready, email ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
}

// Step 3: Scheduling & Delivery
function getSchedulingStep(vars: TemplateVars): ChecklistStep {
  const permitBullet = vars.permitStatus === 'Pulling a Permit'
    ? 'Ensure your building permit is approved (or at minimum submitted) before confirming delivery.'
    : null
  const foundationBullet = vars.foundationType === 'Concrete' || vars.foundationType === 'Stem Wall'
    ? 'Verify your foundation is complete, cured, and anchor bolts are in the correct positions.'
    : 'Verify your site is level, cleared, and there are no underground utilities in anchor locations.'

  return {
    stepNumber: 3,
    title: 'Scheduling & Delivery',
    icon: '🚚',
    timelineLabel: `Week ${vars.estimatedWeeks - 2}–${vars.estimatedWeeks}`,
    action: `Respond promptly when ${vars.mfgName} contacts you to schedule.`,
    bullets: [
      `Your building is estimated to ship within ${vars.estimatedWeeks} weeks from fabrication start.`,
      `${vars.mfgName} will contact you at ${vars.customerEmail} to schedule delivery and installation.`,
      ...(permitBullet ? [permitBullet] : []),
      'Ensure the site is fully prepared, accessible, and clear of obstacles before delivery day.',
      foundationBullet,
    ],
  }
}

// Step 4: Installation Day
function getInstallationStep(vars: TemplateVars): ChecklistStep {
  return {
    stepNumber: 4,
    title: 'Installation Day',
    icon: '🔧',
    timelineLabel: `Week ${vars.estimatedWeeks}+`,
    action: 'Be on-site for the first hour, then do a final walkthrough with the crew.',
    bullets: [
      `The crew from ${vars.mfgName} will arrive with all materials and hardware — typical install takes 1–3 days.`,
      'Be available on-site (or have a representative) for the first hour to confirm placement and site access.',
      'The crew handles all assembly — you do NOT need tools, equipment, or additional labor.',
      `After installation, do a walkthrough. Any issues? Contact ${SUCCESS_TEAM_EMAIL} or call ${SUCCESS_TEAM_PHONE} within 48 hours.`,
    ],
  }
}

interface TemplateVars {
  customerFirstName: string
  customerEmail: string
  state: string
  foundationType: FoundationType
  permitStatus: PermitStatus
  drawingType?: DrawingType
  mfgName: string
  mfgPhone: string
  mfgEmail: string
  mfgContactName: string
  estimatedWeeks: number
}

export function getTemplateKey(
  foundationType: FoundationType,
  permitStatus: PermitStatus,
  drawingType?: DrawingType
): string {
  if (permitStatus === 'No Permit') {
    return `${foundationType}|No Permit`
  }
  return `${foundationType}|Pulling a Permit|${drawingType || 'Generic'}`
}

export function buildSteps(vars: TemplateVars): ChecklistStep[] {
  const permitKey = vars.permitStatus === 'No Permit'
    ? 'No Permit'
    : `Pulling a Permit|${vars.drawingType || 'Generic'}`
  const step1 = permitSteps[permitKey]!(vars)
  const step2 = landPrepSteps[vars.foundationType](vars)
  const step3 = getSchedulingStep(vars)
  const step4 = getInstallationStep(vars)
  return [step1, step2, step3, step4]
}
