export type FoundationType = 'Concrete' | 'Level Ground' | 'Stem Wall' | 'Mixed' | 'Other'
export type PermitStatus = 'No Permit' | 'Pulling a Permit'
export type DrawingType = 'As-Built' | 'Generic'

export interface ManufacturerInfo {
  name: string
  phone: string
  email: string
  contactName: string
  logoUrl?: string
}

export interface ChecklistInput {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  deliveryAddress: string
  state: string
  foundationType: FoundationType
  permitStatus: PermitStatus
  drawingType?: DrawingType // only relevant when pulling a permit
  manufacturer: ManufacturerInfo
  estimatedDeliveryWeeks?: number
}

export interface ChecklistStep {
  stepNumber: number
  title: string
  icon: string
  paragraphs: string[]
}

export interface ChecklistContent {
  customerName: string
  customerEmail: string
  orderNumber: string
  manufacturer: ManufacturerInfo
  foundationType: FoundationType
  permitStatus: PermitStatus
  drawingType?: DrawingType
  templateKey: string
  steps: ChecklistStep[]
}
