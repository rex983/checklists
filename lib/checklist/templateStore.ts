import { EditableTemplateBlock } from './templateTypes'
import { applyManufacturerOverrides, DEFAULT_TEMPLATE_BLOCKS } from './manufacturerTemplates'

const STORAGE_KEY = 'bbd-checklist-templates'

function storageKey(manufacturerId?: string): string {
  return manufacturerId ? `${STORAGE_KEY}:${manufacturerId}` : STORAGE_KEY
}

export function getDefaultTemplateBlocks(): EditableTemplateBlock[] {
  return DEFAULT_TEMPLATE_BLOCKS
}

const MAX_BULLET_LEN = 2000
const MAX_FIELD_LEN = 500
const VALID_STEP_CATEGORIES = new Set(['permit', 'landprep', 'scheduling', 'installation'])

function isValidBullet(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.id !== 'string' || o.id.length > 100) return false
  if (typeof o.text !== 'string' || o.text.length > MAX_BULLET_LEN) return false
  if (typeof o.locked !== 'boolean') return false
  if (o.condition !== undefined) {
    if (!o.condition || typeof o.condition !== 'object') return false
    const c = o.condition as Record<string, unknown>
    if (c.field !== 'permitStatus' && c.field !== 'foundationType') return false
    if (!Array.isArray(c.values) || !c.values.every((v) => typeof v === 'string')) return false
    if (c.altText !== undefined && typeof c.altText !== 'string') return false
  }
  return true
}

function isValidBlock(b: unknown): b is EditableTemplateBlock {
  if (!b || typeof b !== 'object') return false
  const obj = b as Record<string, unknown>
  if (typeof obj.id !== 'string' || obj.id.length > 100) return false
  if (typeof obj.stepCategory !== 'string' || !VALID_STEP_CATEGORIES.has(obj.stepCategory)) return false
  if (typeof obj.title !== 'string' || obj.title.length > MAX_FIELD_LEN) return false
  if (typeof obj.variantLabel !== 'string' || obj.variantLabel.length > MAX_FIELD_LEN) return false
  if (typeof obj.icon !== 'string' || obj.icon.length > 20) return false
  if (typeof obj.timelineLabel !== 'string' || obj.timelineLabel.length > MAX_FIELD_LEN) return false
  if (typeof obj.action !== 'string' || obj.action.length > MAX_BULLET_LEN) return false
  if (!Array.isArray(obj.bullets) || obj.bullets.length > 50) return false
  return obj.bullets.every(isValidBullet)
}

export function loadTemplateBlocks(manufacturerId?: string): EditableTemplateBlock[] {
  const fallback = () => applyManufacturerOverrides(getDefaultTemplateBlocks(), manufacturerId)
  if (typeof window === 'undefined') return fallback()
  const key = storageKey(manufacturerId)
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.every(isValidBlock)) return parsed
      localStorage.removeItem(key)
    }
  } catch { localStorage.removeItem(key) }
  return fallback()
}

export function getDefaultTemplateBlocksFor(manufacturerId?: string): EditableTemplateBlock[] {
  return applyManufacturerOverrides(getDefaultTemplateBlocks(), manufacturerId)
}

export function saveTemplateBlocks(blocks: EditableTemplateBlock[], manufacturerId?: string) {
  localStorage.setItem(storageKey(manufacturerId), JSON.stringify(blocks))
}
