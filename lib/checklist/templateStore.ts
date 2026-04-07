import { EditableTemplateBlock, BulletItem } from './templateTypes'

const STORAGE_KEY = 'bbd-checklist-templates'

function storageKey(manufacturerId?: string): string {
  return manufacturerId ? `${STORAGE_KEY}:${manufacturerId}` : STORAGE_KEY
}

let bid = 0
function bulletId(): string { return `b-${++bid}` }

export function getDefaultTemplateBlocks(): EditableTemplateBlock[] {
  return [
    // ── Step 1: Permitting ──
    {
      id: 'permit:no-permit',
      stepCategory: 'permit',
      variantLabel: 'No Permit',
      title: 'Permitting',
      icon: '📋',
      timelineLabel: 'No action needed',
      action: 'No permit required — move directly to land preparation!',
      bullets: [
        { id: bulletId(), text: 'Based on your project needs, no building permit is required for your structure.', locked: false },
        { id: bulletId(), text: 'You can skip ahead and start preparing your land while your building is being fabricated.', locked: false },
        { id: bulletId(), text: 'If your local jurisdiction contacts you, reach out to {successTeamEmail} or call {successTeamPhone}.', locked: false },
      ],
    },
    {
      id: 'permit:generic',
      stepCategory: 'permit',
      variantLabel: 'Generic Drawings',
      title: 'Permitting — Generic Drawings',
      icon: '📋',
      timelineLabel: 'Weeks 1–2',
      action: 'Submit your permit application as soon as you receive your drawings.',
      bullets: [
        { id: bulletId(), text: 'Your order requires a building permit — we will provide generic engineering drawings.', locked: false },
        { id: bulletId(), text: 'Generic drawings are pre-engineered for your building size and local wind/snow loads, accepted by most jurisdictions.', locked: false },
        { id: bulletId(), text: 'Drawings will be emailed to {customerEmail} within 5–7 business days of fabrication start.', locked: false },
        { id: bulletId(), text: 'Processing times vary by county, so submit early!', locked: false },
      ],
    },
    {
      id: 'permit:as-built',
      stepCategory: 'permit',
      variantLabel: 'As-Built Drawings',
      title: 'Permitting — As-Built Drawings',
      icon: '📐',
      timelineLabel: 'Weeks 1–3',
      action: 'Wait for your finalized as-built drawings before submitting your permit.',
      bullets: [
        { id: bulletId(), text: 'Your order requires site-specific (as-built) engineering drawings for your permit.', locked: false },
        { id: bulletId(), text: 'These are custom-engineered for your exact site conditions — foundation details, setbacks, and local code requirements.', locked: false },
        { id: bulletId(), text: 'As-built drawings typically take 10–14 business days and will be emailed to {customerEmail}.', locked: false },
        { id: bulletId(), text: 'Do NOT submit your permit application until you receive the finalized drawings, as they may differ from standard templates.', locked: false },
      ],
    },

    // ── Step 2: Land Preparation ──
    {
      id: 'landprep:concrete',
      stepCategory: 'landprep',
      variantLabel: 'Concrete',
      title: 'Land Prep — Concrete Foundation',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: 'Hire a concrete contractor and complete your pad before delivery day.',
      bullets: [
        { id: bulletId(), text: 'Your building requires a concrete slab or pad foundation — this must be done BEFORE delivery.', locked: false },
        { id: bulletId(), text: 'Pad must be level (within 1/4" over 10 feet), properly cured (min 7 days, ideally 28), and sized to your building dimensions plus 2" overhang per side.', locked: false },
        { id: bulletId(), text: 'Share your building dimensions and any engineering drawings with your contractor.', locked: false },
        { id: bulletId(), text: '{manufacturer} will be the installer for this building project.', locked: true },
        { id: bulletId(), text: 'Once your land is ready, email {successTeamEmail}.', locked: true },
      ],
    },
    {
      id: 'landprep:level-ground',
      stepCategory: 'landprep',
      variantLabel: 'Level Ground',
      title: 'Land Prep — Level Ground',
      icon: '🏗',
      timelineLabel: 'Weeks 2–4',
      action: "Clear and level your site, then notify us when it's ready.",
      bullets: [
        { id: bulletId(), text: 'Your building will be installed directly on level ground with earth anchors.', locked: false },
        { id: bulletId(), text: 'Clear the area of debris, vegetation, and large rocks — ground should be level within 3" across the footprint.', locked: false },
        { id: bulletId(), text: 'If your site has a slope, a local excavation contractor can typically grade it in 1–2 days.', locked: false },
        { id: bulletId(), text: 'Ensure at least 14 feet of clearance for delivery trucks.', locked: false },
        { id: bulletId(), text: '{manufacturer} will be the installer for this building project.', locked: true },
        { id: bulletId(), text: 'Once your land is ready, email {successTeamEmail}.', locked: true },
      ],
    },
    {
      id: 'landprep:stem-wall',
      stepCategory: 'landprep',
      variantLabel: 'Stem Wall',
      title: 'Land Prep — Stem Wall Foundation',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: 'Hire an experienced concrete contractor for your stem wall.',
      bullets: [
        { id: bulletId(), text: 'Your building requires a stem wall (raised perimeter) foundation — plan ahead, this takes time.', locked: false },
        { id: bulletId(), text: 'Involves pouring a continuous concrete perimeter wall, typically 6–12" above grade, with embedded anchor bolts.', locked: false },
        { id: bulletId(), text: 'Use a contractor experienced with metal building foundations and share all engineering drawings with them.', locked: false },
        { id: bulletId(), text: '{manufacturer} will be the installer for this building project.', locked: true },
        { id: bulletId(), text: 'Once your land is ready, email {successTeamEmail}.', locked: true },
      ],
    },
    {
      id: 'landprep:mixed',
      stepCategory: 'landprep',
      variantLabel: 'Mixed',
      title: 'Land Prep — Mixed Foundation',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: 'Coordinate concrete work for the slab portion and clear the rest.',
      bullets: [
        { id: bulletId(), text: 'Your building uses a mixed approach — concrete slab for part of the structure and earth anchors for the rest.', locked: false },
        { id: bulletId(), text: 'Review your engineering drawings carefully for the specific layout.', locked: false },
        { id: bulletId(), text: 'All concrete work must be completed and cured before your scheduled delivery.', locked: false },
        { id: bulletId(), text: '{manufacturer} will be the installer for this building project.', locked: true },
        { id: bulletId(), text: 'Once your land is ready, email {successTeamEmail}.', locked: true },
      ],
    },
    {
      id: 'landprep:other',
      stepCategory: 'landprep',
      variantLabel: 'Custom',
      title: 'Land Prep — Custom Foundation',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: 'Contact us to confirm your exact foundation requirements.',
      bullets: [
        { id: bulletId(), text: 'Your building has a custom foundation requirement — review your order details and engineering drawings carefully.', locked: false },
        { id: bulletId(), text: 'Ensure your site is cleared, level, and accessible for delivery trucks (min 14 feet clearance).', locked: false },
        { id: bulletId(), text: 'Complete all foundation work at least 2 weeks before delivery for curing and inspections.', locked: false },
        { id: bulletId(), text: '{manufacturer} will be the installer for this building project.', locked: true },
        { id: bulletId(), text: 'Once your land is ready, email {successTeamEmail}.', locked: true },
      ],
    },

    // ── Step 3: Scheduling ──
    {
      id: 'scheduling:default',
      stepCategory: 'scheduling',
      variantLabel: 'Default',
      title: 'Scheduling & Delivery',
      icon: '🚚',
      timelineLabel: 'Week {estimatedWeeksStart}–{estimatedWeeks}',
      action: 'Respond promptly when {manufacturer} contacts you to schedule.',
      bullets: [
        { id: bulletId(), text: 'Your building is estimated to ship within {estimatedWeeks} weeks from fabrication start.', locked: false },
        { id: bulletId(), text: '{manufacturer} will contact you at {customerEmail} to schedule delivery and installation.', locked: false },
        { id: bulletId(), text: 'Ensure your building permit is approved (or at minimum submitted) before confirming delivery.', locked: false, condition: { field: 'permitStatus', values: ['Pulling a Permit'] } },
        { id: bulletId(), text: 'Ensure the site is fully prepared, accessible, and clear of obstacles before delivery day.', locked: false },
        { id: bulletId(), text: 'Verify your foundation is complete, cured, and anchor bolts are in the correct positions.', locked: false, condition: { field: 'foundationType', values: ['Concrete', 'Stem Wall'], altText: 'Verify your site is level, cleared, and there are no underground utilities in anchor locations.' } },
      ],
    },

    // ── Step 4: Installation ──
    {
      id: 'installation:default',
      stepCategory: 'installation',
      variantLabel: 'Default',
      title: 'Installation Day',
      icon: '🔧',
      timelineLabel: 'Week {estimatedWeeks}+',
      action: 'Be on-site for the first hour, then do a final walkthrough with the crew.',
      bullets: [
        { id: bulletId(), text: 'The crew from {manufacturer} will arrive with all materials and hardware — typical install takes 1–3 days.', locked: false },
        { id: bulletId(), text: 'Be available on-site (or have a representative) for the first hour to confirm placement and site access.', locked: false },
        { id: bulletId(), text: 'The crew handles all assembly — you do NOT need tools, equipment, or additional labor.', locked: false },
        { id: bulletId(), text: 'After installation, do a walkthrough. Any issues? Contact {successTeamEmail} or call {successTeamPhone} within 48 hours.', locked: false },
      ],
    },
  ]
}

function isValidBlock(b: unknown): b is EditableTemplateBlock {
  if (!b || typeof b !== 'object') return false
  const obj = b as Record<string, unknown>
  return typeof obj.id === 'string'
    && typeof obj.stepCategory === 'string'
    && typeof obj.title === 'string'
    && Array.isArray(obj.bullets)
}

export function loadTemplateBlocks(manufacturerId?: string): EditableTemplateBlock[] {
  if (typeof window === 'undefined') return getDefaultTemplateBlocks()
  const key = storageKey(manufacturerId)
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.every(isValidBlock)) return parsed
      localStorage.removeItem(key)
    }
  } catch { localStorage.removeItem(key) }
  return getDefaultTemplateBlocks()
}

export function saveTemplateBlocks(blocks: EditableTemplateBlock[], manufacturerId?: string) {
  localStorage.setItem(storageKey(manufacturerId), JSON.stringify(blocks))
}
