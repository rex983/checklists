import { Customer } from './types'
import { defaultCustomers } from './mockData'

const STORAGE_KEY = 'bbd-checklist-customers'

function isValidCustomer(c: unknown): c is Customer {
  if (!c || typeof c !== 'object') return false
  const obj = c as Record<string, unknown>
  return typeof obj.id === 'string'
    && typeof obj.name === 'string'
    && typeof obj.orderNumber === 'string'
    && typeof obj.foundationType === 'string'
    && typeof obj.permitStatus === 'string'
}

export function loadCustomers(): Customer[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.every(isValidCustomer)) return parsed
      localStorage.removeItem(STORAGE_KEY) // corrupted data
    }
  } catch {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }
  // Seed with demo customers on first load
  saveCustomers(defaultCustomers)
  return defaultCustomers
}

export function saveCustomers(customers: Customer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch {}
}
