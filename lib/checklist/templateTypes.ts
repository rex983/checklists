export interface BulletItem {
  id: string
  text: string
  locked: boolean
  condition?: {
    field: 'permitStatus' | 'foundationType'
    values: string[]
    altText?: string
  }
}

export interface EditableTemplateBlock {
  id: string
  stepCategory: 'permit' | 'landprep' | 'scheduling' | 'installation'
  variantLabel: string
  title: string
  icon: string
  timelineLabel: string
  action: string
  bullets: BulletItem[]
}

export const TEMPLATE_VARIABLES = [
  { token: '{manufacturer}', label: 'Manufacturer Name', example: 'Eagle Carports' },
  { token: '{customerFirstName}', label: 'Customer First Name', example: 'John' },
  { token: '{customerEmail}', label: 'Customer Email', example: 'john@email.com' },
  { token: '{estimatedWeeks}', label: 'Estimated Weeks', example: '8' },
  { token: '{estimatedWeeksStart}', label: 'Est. Weeks Start', example: '6' },
  { token: '{successTeamPhone}', label: 'Success Team Phone', example: '(813) 692-7320' },
  { token: '{successTeamEmail}', label: 'Success Team Email', example: 'SuccessTeam@bigbuildingsdirect.com' },
] as const

export const STEP_CATEGORIES = [
  { key: 'permit' as const, label: 'Step 1: Permitting', icon: '📋' },
  { key: 'landprep' as const, label: 'Step 2: Land Prep', icon: '🏗' },
  { key: 'scheduling' as const, label: 'Step 3: Scheduling', icon: '🚚' },
  { key: 'installation' as const, label: 'Step 4: Installation', icon: '🔧' },
]
