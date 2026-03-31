import { ChecklistStep, FoundationType, PermitStatus, DrawingType } from './types'
import { EditableTemplateBlock, BulletItem } from './templateTypes'

const SUCCESS_TEAM_PHONE = '(813) 692-7320'
const SUCCESS_TEAM_EMAIL = 'SuccessTeam@bigbuildingsdirect.com'

export interface RenderVars {
  manufacturer: string
  customerFirstName: string
  customerEmail: string
  estimatedWeeks: number
  estimatedWeeksStart: number
  successTeamPhone: string
  successTeamEmail: string
  permitStatus: PermitStatus
  foundationType: FoundationType
  drawingType?: DrawingType
}

function replaceTokens(text: string, vars: RenderVars): string {
  return text
    .replace(/\{manufacturer\}/g, vars.manufacturer)
    .replace(/\{customerFirstName\}/g, vars.customerFirstName)
    .replace(/\{customerEmail\}/g, vars.customerEmail)
    .replace(/\{estimatedWeeks\}/g, String(vars.estimatedWeeks))
    .replace(/\{estimatedWeeksStart\}/g, String(vars.estimatedWeeksStart))
    .replace(/\{successTeamPhone\}/g, vars.successTeamPhone)
    .replace(/\{successTeamEmail\}/g, vars.successTeamEmail)
}

function shouldShowBullet(bullet: BulletItem, vars: RenderVars): boolean {
  if (!bullet.condition) return true
  const fieldValue = vars[bullet.condition.field as keyof RenderVars] as string
  return bullet.condition.values.includes(fieldValue)
}

function getBulletText(bullet: BulletItem, vars: RenderVars): string {
  if (bullet.condition && !bullet.condition.values.includes(vars[bullet.condition.field as keyof RenderVars] as string)) {
    return bullet.condition.altText ? replaceTokens(bullet.condition.altText, vars) : ''
  }
  return replaceTokens(bullet.text, vars)
}

export function renderTemplateBlock(block: EditableTemplateBlock, vars: RenderVars): ChecklistStep {
  const bullets: string[] = []
  for (const b of block.bullets) {
    if (!b.condition) {
      bullets.push(replaceTokens(b.text, vars))
    } else {
      const text = getBulletText(b, vars)
      if (text) bullets.push(text)
      else if (b.condition.altText) bullets.push(replaceTokens(b.condition.altText, vars))
    }
  }

  return {
    stepNumber: block.stepCategory === 'permit' ? 1
      : block.stepCategory === 'landprep' ? 2
      : block.stepCategory === 'scheduling' ? 3 : 4,
    title: replaceTokens(block.title, vars),
    icon: block.icon,
    timelineLabel: replaceTokens(block.timelineLabel, vars),
    action: replaceTokens(block.action, vars),
    bullets,
  }
}

// Map permit status + drawing type to block ID
function getPermitBlockId(permitStatus: PermitStatus, drawingType?: DrawingType): string {
  if (permitStatus === 'No Permit') return 'permit:no-permit'
  if (drawingType === 'As-Built') return 'permit:as-built'
  return 'permit:generic'
}

// Map foundation type to block ID
function getLandprepBlockId(foundationType: FoundationType): string {
  const map: Record<FoundationType, string> = {
    'Concrete': 'landprep:concrete',
    'Level Ground': 'landprep:level-ground',
    'Stem Wall': 'landprep:stem-wall',
    'Mixed': 'landprep:mixed',
    'Other': 'landprep:other',
  }
  return map[foundationType]
}

export function buildStepsFromStore(vars: RenderVars, blocks: EditableTemplateBlock[]): ChecklistStep[] {
  const blockMap = new Map(blocks.map(b => [b.id, b]))

  const permitBlock = blockMap.get(getPermitBlockId(vars.permitStatus, vars.drawingType))!
  const landprepBlock = blockMap.get(getLandprepBlockId(vars.foundationType))!
  const schedulingBlock = blockMap.get('scheduling:default')!
  const installationBlock = blockMap.get('installation:default')!

  return [
    renderTemplateBlock(permitBlock, vars),
    renderTemplateBlock(landprepBlock, vars),
    renderTemplateBlock(schedulingBlock, vars),
    renderTemplateBlock(installationBlock, vars),
  ]
}

export function inputToRenderVars(input: {
  customerFirstName: string
  customerEmail: string
  manufacturer: string
  estimatedWeeks: number
  permitStatus: PermitStatus
  foundationType: FoundationType
  drawingType?: DrawingType
}): RenderVars {
  return {
    ...input,
    estimatedWeeksStart: Math.max(1, input.estimatedWeeks - 2),
    successTeamPhone: SUCCESS_TEAM_PHONE,
    successTeamEmail: SUCCESS_TEAM_EMAIL,
  }
}
