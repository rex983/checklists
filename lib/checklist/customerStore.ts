import { Customer } from './types'

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
  } catch { localStorage.removeItem(STORAGE_KEY) }
  return []
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}
