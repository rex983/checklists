import { FoundationType, PermitStatus, DrawingType } from './types'

const EMAIL_REGEX = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/
const UNSAFE_CHARS = /[\r\n\0]/

const VALID_FOUNDATIONS: FoundationType[] = ['Concrete', 'Level Ground', 'Stem Wall', 'Mixed', 'Other']
const VALID_PERMIT_STATUSES: PermitStatus[] = ['No Permit', 'Pulling a Permit']
const VALID_DRAWING_TYPES: DrawingType[] = ['As-Built', 'Generic']

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254
}

export function sanitizeString(str: string, maxLength = 200): string {
  return str.replace(UNSAFE_CHARS, '').slice(0, maxLength)
}

export function hasUnsafeChars(str: string): boolean {
  return UNSAFE_CHARS.test(str)
}

export function isValidFoundationType(v: string): v is FoundationType {
  return (VALID_FOUNDATIONS as string[]).includes(v)
}

export function isValidPermitStatus(v: string): v is PermitStatus {
  return (VALID_PERMIT_STATUSES as string[]).includes(v)
}

export function isValidDrawingType(v: string): v is DrawingType {
  return (VALID_DRAWING_TYPES as string[]).includes(v)
}

const SAFE_DATA_URL = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/

export function isSafeUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('/')) return true // local paths
  if (SAFE_DATA_URL.test(url)) return true // base64 raster images only (no SVG)
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export interface ValidationError {
  field: string
  message: string
}

export function validateChecklistInput(input: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!input.customerName || typeof input.customerName !== 'string') {
    errors.push({ field: 'customerName', message: 'Required' })
  } else if (hasUnsafeChars(input.customerName)) {
    errors.push({ field: 'customerName', message: 'Contains invalid characters' })
  } else if (input.customerName.length > 100) {
    errors.push({ field: 'customerName', message: 'Too long (max 100)' })
  }

  if (!input.customerEmail || typeof input.customerEmail !== 'string') {
    errors.push({ field: 'customerEmail', message: 'Required' })
  } else if (!validateEmail(input.customerEmail)) {
    errors.push({ field: 'customerEmail', message: 'Invalid email format' })
  }

  if (input.orderNumber && typeof input.orderNumber === 'string' && input.orderNumber.length > 50) {
    errors.push({ field: 'orderNumber', message: 'Too long (max 50)' })
  }

  if (!input.manufacturer || typeof input.manufacturer !== 'object') {
    errors.push({ field: 'manufacturer', message: 'Required' })
  }

  if (input.foundationType && !isValidFoundationType(input.foundationType as string)) {
    errors.push({ field: 'foundationType', message: 'Invalid value' })
  }

  if (input.permitStatus && !isValidPermitStatus(input.permitStatus as string)) {
    errors.push({ field: 'permitStatus', message: 'Invalid value' })
  }

  if (input.drawingType && !isValidDrawingType(input.drawingType as string)) {
    errors.push({ field: 'drawingType', message: 'Invalid value' })
  }

  return errors
}
