import { ManufacturerInfo } from './types'
import { defaultManufacturers } from './mockData'

const STORAGE_KEY = 'bbd-checklist-manufacturers'

function isValidManufacturer(m: unknown): m is ManufacturerInfo {
  if (!m || typeof m !== 'object') return false
  const obj = m as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.name === 'string'
}

export function loadManufacturers(): ManufacturerInfo[] {
  if (typeof window === 'undefined') return defaultManufacturers
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.every(isValidManufacturer)) return parsed
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { localStorage.removeItem(STORAGE_KEY) }
  return defaultManufacturers
}

export function saveManufacturers(manufacturers: ManufacturerInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manufacturers))
}
