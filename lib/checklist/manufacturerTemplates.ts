import { EditableTemplateBlock, BulletItem } from './templateTypes'

let bid = 0
function bulletId(): string { return `mb-${++bid}` }
function b(text: string, locked = false): BulletItem {
  return { id: bulletId(), text, locked }
}
function bIf(
  text: string,
  field: 'permitStatus' | 'foundationType',
  values: string[],
  altText?: string,
): BulletItem {
  return { id: bulletId(), text, locked: false, condition: { field, values, altText } }
}

/**
 * Per-manufacturer template overrides. Keyed by manufacturer id, then by
 * block id. Anything not overridden falls back to the default block.
 */
export const MANUFACTURER_TEMPLATE_OVERRIDES: Record<
  string,
  Partial<Record<string, EditableTemplateBlock>>
> = {
  'american-steel': {
    // Step 1 — Permitting (No Permit variant)
    'permit:no-permit': {
      id: 'permit:no-permit',
      stepCategory: 'permit',
      variantLabel: 'No Permit',
      title: 'Permitting',
      icon: '📋',
      timelineLabel: 'No action needed',
      action: '',
      bullets: [
        b("Permitting is the customer's responsibility. If you decide to pull a permit, you can get engineered drawings from the installers. Their contact information can be found at the top of this page. Depending on your location, the drawings may or may not come at an additional cost."),
      ],
    },

    // Step 1 — Permitting (Generic Drawings variant)
    'permit:generic': {
      id: 'permit:generic',
      stepCategory: 'permit',
      variantLabel: 'Generic Drawings',
      title: 'Permitting',
      icon: '📋',
      timelineLabel: 'Weeks 1–2',
      action: '',
      bullets: [
        b('Your engineered drawings should be sent to you within 2 weeks of your order being sent to the installers. If you do not receive your engineered drawings within 2 weeks of your order being sent to the installers, give them a call and let them know you need your set of generic engineering drawings. Their information can be found at the top of the page.'),
        b('Once you have your generic engineered drawings in hand, you will be able to apply for permitting with your local county. Be sure to check with your local county for all documentation requirements. If the permit office requires custom site-specific engineered drawings, we can have those custom drawings made for you at an additional cost.'),
        b('After the permit is accepted, you are ready for the next step, preparing your land!'),
      ],
    },

    // Step 1 — Permitting (As-Built variant)
    'permit:as-built': {
      id: 'permit:as-built',
      stepCategory: 'permit',
      variantLabel: 'As-Built Drawings',
      title: 'Permitting',
      icon: '📋',
      timelineLabel: 'Weeks 1–2',
      action: '',
      bullets: [
        b('After you sign your order form, please allow 5-7 business days for the order to be completely processed.'),
        b('After 5-7 business days, call the installer to have your site-specific drawings ordered. Their information can be found at the top of this page. REMINDER: Site-specific drawings are an additional cost that must be paid for at the time of the purchasing of the drawings.'),
        b('On this phone call, the installers will go over all of the details of the building so the engineer can draw up the exact site specifications drawings.'),
        b('Once you have your site-specific engineered drawings in hand, you will be able to apply for permitting with your local county. Be sure to check with your local county for all documentation requirements. After the permit is accepted, you are ready for the next step, preparing your land!'),
      ],
    },

    // Step 2 — Land Prep (Concrete variant — branches by permit status)
    'landprep:concrete': {
      id: 'landprep:concrete',
      stepCategory: 'landprep',
      variantLabel: 'Concrete',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: '',
      bullets: [
        // Pulling a Permit (As-Built / Generic)
        bIf(
          'Give your concrete contractor the foundation details page. This can be found in the set of engineered drawings you receive from your installers.',
          'permitStatus',
          ['Pulling a Permit'],
        ),
        bIf(
          "Your concrete must be poured exactly as per your site-specific engineered plans. Your engineer has them constructed to match your site specifically and follow any local county requirements. Your almost to the end now it's time to call and get on schedule!!",
          'permitStatus',
          ['Pulling a Permit'],
        ),
        // No Permit
        bIf(
          'Be sure to double check with your local county permitting office in case they have any specific foundation requirements.',
          'permitStatus',
          ['No Permit'],
        ),
        bIf(
          'Make sure you check with the installers for their concrete requirements for this building project.',
          'permitStatus',
          ['No Permit'],
        ),
        bIf(
          "Now that your foundation is prepared you can move on to the scheduling portion of the project You're almost there!.",
          'permitStatus',
          ['No Permit'],
        ),
        // Always-shown locked auto-info
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },

    // Step 2 — Land Prep (Asphalt / Gravel / Level Ground all share the same wording)
    'landprep:asphalt': {
      id: 'landprep:asphalt',
      stepCategory: 'landprep',
      variantLabel: 'Asphalt',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–4',
      action: '',
      bullets: [
        b('Make sure your ground is completely level, within 3 inches, so the install crew can install the building properly.'),
        b('Be sure to follow any requirements your local county may have for the foundation.'),
        b("Now that your land is prepared you can move on to the scheduling portion of the project. You're almost there!."),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },
    'landprep:gravel': {
      id: 'landprep:gravel',
      stepCategory: 'landprep',
      variantLabel: 'Gravel',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–4',
      action: '',
      bullets: [
        b('Make sure your ground is completely level, within 3 inches, so the install crew can install the building properly.'),
        b('Be sure to follow any requirements your local county may have for the foundation.'),
        b("Now that your land is prepared you can move on to the scheduling portion of the project. You're almost there!."),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },
    'landprep:level-ground': {
      id: 'landprep:level-ground',
      stepCategory: 'landprep',
      variantLabel: 'Level Ground',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–4',
      action: '',
      bullets: [
        b('Make sure your ground is completely level, within 3 inches, so the install crew can install the building properly.'),
        b('Be sure to follow any requirements your local county may have for the foundation.'),
        bIf(
          "Now that your land is prepared you can move on to the scheduling portion of the project. You're almost there!.",
          'permitStatus',
          ['Pulling a Permit'],
          "Now that your land is prepared you can move on to the scheduling portion of the project. You're almost there!",
        ),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },

    // Step 2 — Land Prep (Stem Wall / Strip Footer variant — mirrors Concrete)
    'landprep:stem-wall': {
      id: 'landprep:stem-wall',
      stepCategory: 'landprep',
      variantLabel: 'Stem Wall',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: '',
      bullets: [
        b('Give your concrete contractor the foundation details page. This can be found in the set of engineered drawings you receive from your installers.'),
        b("Your concrete must be poured exactly as per your site-specific engineered plans. Your engineer has them constructed to match your site specifically and follow any local county requirements. Your almost to the end now it's time to call and get on schedule!!"),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },

    // Step 2 — Land Prep (Mixed foundation)
    'landprep:mixed': {
      id: 'landprep:mixed',
      stepCategory: 'landprep',
      variantLabel: 'Mixed',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: '',
      bullets: [
        b('Give your concrete contractor the foundation details page. This can be found in the set of engineered drawings you receive from your installers. If you have questions about foundation ask your installers.'),
        b("Your foundation must be poured exactly as per your site-specific engineered plans. Your engineer has them constructed to match your building specifically and follow any local county requirements. Your almost to the end now it's time to call and get on schedule!!"),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },

    // Step 2 — Land Prep (Other / Custom foundation)
    'landprep:other': {
      id: 'landprep:other',
      stepCategory: 'landprep',
      variantLabel: 'Custom',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: '',
      bullets: [
        b('Give your concrete contractor the foundation details page. This can be found in the set of engineered drawings you receive from your installers. If you have questions about foundation ask your installers.'),
        b("Your foundation must be poured exactly as per your site-specific engineered plans. Your engineer has them constructed to match your building specifically and follow any local county requirements. Your almost to the end now it's time to call and get on schedule!!"),
        b('{manufacturer} will be the installer for this building project.', true),
        b('Once your land is ready, email {successTeamEmail}.', true),
      ],
    },

    // Step 3 — Scheduling
    'scheduling:default': {
      id: 'scheduling:default',
      stepCategory: 'scheduling',
      variantLabel: 'Default',
      title: 'Scheduling',
      icon: '🚚',
      timelineLabel: 'Week {estimatedWeeksStart}–{estimatedWeeks}',
      action: '',
      bullets: [
        bIf(
          '** MOST IMPORTANT** Email or Text Pictures of Permit and Site Work to {successTeamPhone} or {successTeamEmail}!!',
          'permitStatus',
          ['Pulling a Permit'],
          '** MOST IMPORTANT** Email or Text Pictures of Site Work to {successTeamPhone} or {successTeamEmail}!!',
        ),
        bIf(
          'Now that your permit has been approved and your land is ready for install, the next step is to text or email pictures of your permit and site work. (Both have to be completed before scheduling.)',
          'permitStatus',
          ['Pulling a Permit'],
          'Now that your land is ready for install, the next step is to text or email pictures of your site work. (Site work must be completed before scheduling.)',
        ),
        b("For many customers, the most frustrating part of the process is the wait in between being ready for install and the installation crew coming to deliver the building. Once you're placed on the schedule, the scheduler looks for a delivery date. Our installers are able to do these buildings at this price point by going out on run deliveries and taking multiple buildings on a truck for multiple installs per run. Any delivery time given is an estimate based on weather conditions and volume of orders received in your area. Once the installers have a delivery date for you, they will typically reach out to you 1-2 weeks prior with your estimated delivery date."),
      ],
    },

    // Step 4 — Delivered & Installed
    'installation:default': {
      id: 'installation:default',
      stepCategory: 'installation',
      variantLabel: 'Default',
      title: 'Delivered Installed Building',
      icon: '🔧',
      timelineLabel: 'Week {estimatedWeeks}+',
      action: '',
      bullets: [
        b('The best step of the whole process! The installation crew comes to delivers and installs your building!! Congratulations and enjoy your brand new building!'),
      ],
    },
  },
}

export function applyManufacturerOverrides(
  blocks: EditableTemplateBlock[],
  manufacturerId?: string,
): EditableTemplateBlock[] {
  if (!manufacturerId) return blocks
  const overrides = MANUFACTURER_TEMPLATE_OVERRIDES[manufacturerId]
  if (!overrides) return blocks
  return blocks.map((block) => overrides[block.id] ?? block)
}
