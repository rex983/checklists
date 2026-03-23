import { FoundationType, PermitStatus, DrawingType, ChecklistStep } from './types'

const SUCCESS_TEAM_PHONE = '(813) 692-7320'
const SUCCESS_TEAM_EMAIL = 'SuccessTeam@bigbuildingsdirect.com'
const SUCCESS_TEAM_NAME = 'our Success Team'

// Step 1: Permitting — varies by permitStatus + drawingType
const permitSteps: Record<string, (vars: TemplateVars) => ChecklistStep> = {
  'No Permit': (vars) => ({
    stepNumber: 1,
    title: 'Permitting — Not Required',
    icon: '✓',
    paragraphs: [
      `Great news, ${vars.customerFirstName}! Based on your location in ${vars.state}, no building permit is required for your structure.`,
      'You can move directly to land preparation while your building is being fabricated.',
      `If your local jurisdiction contacts you or you have questions, reach out to ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} or ${SUCCESS_TEAM_EMAIL}.`,
    ],
  }),
  'Pulling a Permit|Generic': (vars) => ({
    stepNumber: 1,
    title: 'Permitting — Generic Drawings',
    icon: '📋',
    paragraphs: [
      `${vars.customerFirstName}, your order requires a building permit. We will provide generic engineering drawings for your permit application.`,
      'Generic drawings are pre-engineered for your building size and local wind/snow loads. They are accepted by most jurisdictions.',
      `Your drawings will be sent to ${vars.customerEmail} within 5-7 business days of fabrication start. Contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} for status updates.`,
      'Submit your permit application as soon as you receive the drawings — processing times vary by county.',
    ],
  }),
  'Pulling a Permit|As-Built': (vars) => ({
    stepNumber: 1,
    title: 'Permitting — Site-Specific (As-Built) Drawings',
    icon: '📐',
    paragraphs: [
      `${vars.customerFirstName}, your order requires a building permit with site-specific (as-built) engineering drawings.`,
      'As-built drawings are custom-engineered for your exact site conditions, including foundation details, setbacks, and local code requirements.',
      `These drawings typically take 10-14 business days. They will be sent to ${vars.customerEmail}. Contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} for status.`,
      'Important: Do NOT submit your permit application until you receive the finalized as-built drawings, as they may differ from standard templates.',
    ],
  }),
}

// Step 2: Land Preparation — varies by foundationType
const landPrepSteps: Record<FoundationType, (vars: TemplateVars) => ChecklistStep> = {
  'Concrete': (vars) => ({
    stepNumber: 2,
    title: 'Land Preparation — Concrete Foundation',
    icon: '🏗️',
    paragraphs: [
      `${vars.customerFirstName}, your building requires a concrete slab or pad foundation. This must be completed BEFORE your delivery date.`,
      'Requirements: The concrete pad must be level (within 1/4" over 10 feet), properly cured (minimum 7 days, ideally 28), and sized to your building dimensions plus 2" overhang on each side.',
      'Hire a licensed concrete contractor in your area. Share your building dimensions and any engineering drawings with them.',
      `Your manufacturer (${vars.mfgName}) can provide anchor bolt layout specifications. Contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} and we'll coordinate with them.`,
    ],
  }),
  'Level Ground': (vars) => ({
    stepNumber: 2,
    title: 'Land Preparation — Level Ground',
    icon: '🏗️',
    paragraphs: [
      `${vars.customerFirstName}, your building will be installed directly on level ground with earth anchors.`,
      'Requirements: The installation area must be cleared of debris, vegetation, and large rocks. The ground should be level within 3" across the building footprint.',
      'If your site has a slope, you may need to grade the area. A local excavation contractor can typically complete this in 1-2 days.',
      'The installation crew will bring earth anchors. Ensure the crew has clear access to the site with at least 14 feet of clearance for delivery trucks.',
    ],
  }),
  'Stem Wall': (vars) => ({
    stepNumber: 2,
    title: 'Land Preparation — Stem Wall Foundation',
    icon: '🏗️',
    paragraphs: [
      `${vars.customerFirstName}, your building requires a stem wall (raised perimeter) foundation. This is a more involved foundation and must be completed well before delivery.`,
      'A stem wall foundation involves pouring a continuous concrete perimeter wall, typically 6-12" above grade, with embedded anchor bolts.',
      'You will need a licensed concrete contractor experienced with metal building foundations. Share all engineering drawings and anchor bolt layouts with them.',
      `Contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} for the detailed stem wall specifications and anchor bolt template for your building.`,
    ],
  }),
  'Mixed': (vars) => ({
    stepNumber: 2,
    title: 'Land Preparation — Mixed Foundation',
    icon: '🏗️',
    paragraphs: [
      `${vars.customerFirstName}, your building uses a mixed foundation approach (combination of concrete and ground-mounted sections).`,
      'This typically means a concrete slab for part of the structure and earth anchors for the remainder. Review your engineering drawings carefully for the specific layout.',
      'Coordinate with a concrete contractor for the slab portion. Ensure all concrete work is completed and cured before your scheduled delivery.',
      `For the exact foundation layout and specifications, contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE}.`,
    ],
  }),
  'Other': (vars) => ({
    stepNumber: 2,
    title: 'Land Preparation — Custom Foundation',
    icon: '🏗️',
    paragraphs: [
      `${vars.customerFirstName}, your building has a custom foundation requirement. Please review your order details and engineering drawings carefully.`,
      'Ensure your site is cleared, level, and accessible for delivery trucks (minimum 14 feet clearance).',
      `Contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} to confirm the exact foundation requirements and specifications for your building.`,
      'We recommend completing all foundation work at least 2 weeks before your scheduled delivery to allow for curing and inspections.',
    ],
  }),
}

// Step 3: Scheduling & Delivery — same structure, minor permit variation
function getSchedulingStep(vars: TemplateVars): ChecklistStep {
  const permitNote = vars.permitStatus === 'Pulling a Permit'
    ? ' Make sure your building permit is approved (or at minimum submitted) before confirming your delivery date.'
    : ''

  return {
    stepNumber: 3,
    title: 'Scheduling & Delivery',
    icon: '🚚',
    paragraphs: [
      `${vars.customerFirstName}, your building is estimated to ship within ${vars.estimatedWeeks} weeks from the fabrication start date.${permitNote}`,
      `${vars.mfgName} will contact you at ${vars.customerEmail} to schedule your delivery and installation date. Please respond promptly to avoid delays.`,
      'Before delivery day: Ensure the site is fully prepared, accessible, and clear of obstacles. The installation crew needs room to maneuver materials and equipment.',
      vars.foundationType === 'Concrete' || vars.foundationType === 'Stem Wall'
        ? 'Verify that your foundation is complete, cured, and that anchor bolts are in the correct positions before the crew arrives.'
        : 'Verify that your site is level, cleared, and that there are no underground utilities in the anchor locations.',
    ],
  }
}

// Step 4: What to Expect on Installation Day — universal
function getInstallationStep(vars: TemplateVars): ChecklistStep {
  return {
    stepNumber: 4,
    title: 'Installation Day',
    icon: '🔧',
    paragraphs: [
      `On installation day, the crew from ${vars.mfgName} will arrive with all building materials and hardware. A typical installation takes 1-3 days depending on building size.`,
      'Please be available on-site (or have a representative present) for the first hour to walk the crew through site access, confirm placement, and address any questions.',
      'The crew will handle all assembly. You do NOT need to provide tools, equipment, or additional labor unless otherwise specified in your order.',
      `After installation, do a walkthrough with the crew. If you notice any issues, contact ${SUCCESS_TEAM_NAME} at ${SUCCESS_TEAM_PHONE} or email ${SUCCESS_TEAM_EMAIL} within 48 hours.`,
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
  // Step 1: Permit
  const permitKey = vars.permitStatus === 'No Permit'
    ? 'No Permit'
    : `Pulling a Permit|${vars.drawingType || 'Generic'}`
  const step1 = permitSteps[permitKey]!(vars)

  // Step 2: Land prep
  const step2 = landPrepSteps[vars.foundationType](vars)

  // Step 3: Scheduling
  const step3 = getSchedulingStep(vars)

  // Step 4: Installation
  const step4 = getInstallationStep(vars)

  return [step1, step2, step3, step4]
}
