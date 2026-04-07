import { ChecklistInput, ChecklistContent } from './types'
import { getTemplateKey } from './templates'
import { loadTemplateBlocks } from './templateStore'
import { buildStepsFromStore, inputToRenderVars } from './templateRenderer'

export function generateChecklist(input: ChecklistInput): ChecklistContent {
  const firstName = input.customerName.split(' ')[0]
  // Manufacturer first: load that manufacturer's template (falls back to
  // defaults if none has been customized yet). Land prep / permitting /
  // drawing variants are then selected from those blocks downstream.
  const blocks = loadTemplateBlocks(input.manufacturer.id)

  const vars = inputToRenderVars({
    customerFirstName: firstName,
    customerEmail: input.customerEmail,
    manufacturer: input.manufacturer.name,
    estimatedWeeks: input.estimatedDeliveryWeeks ?? 8,
    permitStatus: input.permitStatus,
    foundationType: input.foundationType,
    drawingType: input.drawingType,
  })

  const steps = buildStepsFromStore(vars, blocks)
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
