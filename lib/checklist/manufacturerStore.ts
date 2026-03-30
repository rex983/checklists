import { ManufacturerInfo } from './types'
import { defaultManufacturers } from './mockData'

const STORAGE_KEY = 'bbd-checklist-manufacturers'

export function loadManufacturers(): ManufacturerInfo[] {
  if (typeof window === 'undefined') return defaultManufacturers
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return defaultManufacturers
}

export function saveManufacturers(manufacturers: ManufacturerInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manufacturers))
}
