import { EditableTemplateBlock, BulletItem } from './templateTypes'

let bid = 0
function bulletId(): string { return `mb-${++bid}` }
function b(text: string, locked = false): BulletItem {
  return { id: bulletId(), text, locked }
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
    // Step 1 — Permitting (As-Built variant)
    'permit:as-built': {
      id: 'permit:as-built',
      stepCategory: 'permit',
      variantLabel: 'As-Built Drawings',
      title: 'Permitting',
      icon: '📋',
      timelineLabel: 'Weeks 1–2',
      action: 'Order your site-specific drawings, then apply for your permit.',
      bullets: [
        b('After you sign your order form, please allow 5-7 business days for the order to be completely processed.'),
        b('After 5-7 business days, call the installer to have your site-specific drawings ordered. Their information can be found at the top of this page. REMINDER: Site-specific drawings are an additional cost that must be paid for at the time of the purchasing of the drawings.'),
        b('On this phone call, the installers will go over all of the details of the building so the engineer can draw up the exact site specifications drawings.'),
        b('Once you have your site-specific engineered drawings in hand, you will be able to apply for permitting with your local county. Be sure to check with your local county for all documentation requirements. After the permit is accepted, you are ready for the next step, preparing your land!'),
      ],
    },

    // Step 2 — Land Prep (Concrete variant)
    'landprep:concrete': {
      id: 'landprep:concrete',
      stepCategory: 'landprep',
      variantLabel: 'Concrete',
      title: 'Land Prep',
      icon: '🏗',
      timelineLabel: 'Weeks 2–6',
      action: 'Pour your concrete pad exactly to the site-specific engineered plans.',
      bullets: [
        b('Give your concrete contractor the foundation details page. This can be found in the set of engineered drawings you receive from your installers.'),
        b("Your concrete must be poured exactly as per your site-specific engineered plans. Your engineer has them constructed to match your site specifically and follow any local county requirements. Your almost to the end now it's time to call and get on schedule!!"),
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
      action: 'Email or text photos of your permit and site work to the Success Team.',
      bullets: [
        b('** MOST IMPORTANT** Email or Text Pictures of Permit and Site Work to {successTeamPhone} or {successTeamEmail}!!'),
        b('Now that your permit has been approved and your land is ready for install, the next step is to text or email pictures of your permit and site work. (Both have to be completed before scheduling.)'),
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
      action: 'Enjoy your brand new building!',
      bullets: [
        b('The best step of the whole process! The installation crew comes to deliver and install your building!! Congratulations and enjoy your brand new building!'),
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
