import { EditableTemplateBlock } from './templateTypes'
import { applyManufacturerOverrides, DEFAULT_TEMPLATE_BLOCKS } from './manufacturerTemplates'

const STORAGE_KEY = 'bbd-checklist-templates'

function storageKey(manufacturerId?: string): string {
  return manufacturerId ? `${STORAGE_KEY}:${manufacturerId}` : STORAGE_KEY
}

export function getDefaultTemplateBlocks(): EditableTemplateBlock[] {
  return DEFAULT_TEMPLATE_BLOCKS
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
