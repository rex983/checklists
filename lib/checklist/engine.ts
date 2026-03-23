import { ChecklistInput, ChecklistContent } from './types'
import { getTemplateKey, buildSteps } from './templates'

export function generateChecklist(input: ChecklistInput): ChecklistContent {
  const firstName = input.customerName.split(' ')[0]

  const vars = {
    customerFirstName: firstName,
    customerEmail: input.customerEmail,
    state: input.state,
    foundationType: input.foundationType,
    permitStatus: input.permitStatus,
    drawingType: input.drawingType,
    mfgName: input.manufacturer.name,
    mfgPhone: input.manufacturer.phone,
    mfgEmail: input.manufacturer.email,
    mfgContactName: input.manufacturer.contactName,
    estimatedWeeks: input.estimatedDeliveryWeeks ?? 8,
  }

  const steps = buildSteps(vars)
  const templateKey = getTemplateKey(input.foundationType, input.permitStatus, input.drawingType)

  return {
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    orderNumber: input.orderNumber,
    manufacturer: input.manufacturer,
    foundationType: input.foundationType,
    permitStatus: input.permitStatus,
    drawingType: input.drawingType,
    templateKey,
    steps,
  }
}
