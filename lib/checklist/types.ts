export type FoundationType = 'Concrete' | 'Asphalt' | 'Gravel' | 'Level Ground' | 'Stem Wall' | 'Mixed' | 'Other'
export type PermitStatus = 'No Permit' | 'Pulling a Permit'
export type DrawingType = 'As-Built' | 'Generic'

export interface ManufacturerInfo {
  id: string
  name: string
  phone: string
  email: string
  contactName: string
  logoUrl: string
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
  action: string          // the ONE thing they need to do
  bullets: string[]       // scannable bullet points
  timelineLabel: string   // e.g. "Weeks 1-2"
}

export type ChecklistStatus = 'Not Sent' | 'Sent' | 'Viewed'

export interface Customer {
  id: string
  orderNumber: string
  name: string
  email: string
  phone: string
  deliveryAddress: string
  state: string
  foundationType: FoundationType
  permitStatus: PermitStatus
  drawingType?: DrawingType
  manufacturerId: string
  estimatedDeliveryWeeks: number
  checklistStatus: ChecklistStatus
  notes: string
  createdAt: string
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
