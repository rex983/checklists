import { ChecklistInput, ManufacturerInfo } from './types'

/**
 * Checklist Service — handles sending checklist emails.
 *
 * In the Order Process app, call `sendChecklistForOrder()` when an order
 * transitions to "ready_for_manufacturer" status. This can be called from:
 *
 * 1. The order status update function in orderService.ts
 * 2. A Supabase database webhook (via /api/checklist/webhook)
 * 3. Manually by BST from the customer management UI
 */

/**
 * Send a checklist email for a given order.
 * Calls the /api/checklist/send endpoint.
 */
export async function sendChecklistEmail(input: ChecklistInput): Promise<{
  success: boolean
  sent: boolean
  templateKey?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/checklist/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return await response.json()
  } catch (error) {
    return { success: false, sent: false, error: String(error) }
  }
}

/**
 * Map an Order Process order to ChecklistInput.
 * Use this when triggering from the frontend after a status change.
 *
 * Usage in Order Process:
 *   import { mapOrderToChecklistInput } from '@/lib/checklist/checklistService'
 *   import { sendChecklistEmail } from '@/lib/checklist/checklistService'
 *
 *   // In your order status update handler:
 *   if (newStatus === 'ready_for_manufacturer') {
 *     const manufacturer = await getManufacturerByName(order.building.manufacturer)
 *     const input = mapOrderToChecklistInput(order, manufacturer)
 *     await sendChecklistEmail(input)
 *   }
 */
export function mapOrderToChecklistInput(
  order: {
    id?: string
    orderNumber: string
    customer: {
      firstName: string
      lastName: string
      email: string
      deliveryAddress: string
      state: string
    }
    building: {
      manufacturer: string
      foundationType: string
      permittingStructure: string
      drawingType: string
    }
  },
  manufacturer: ManufacturerInfo
): ChecklistInput {
  const permitStatus = order.building.permittingStructure === 'No Permit'
    ? 'No Permit' as const
    : 'Pulling a Permit' as const

  const drawingType = permitStatus === 'Pulling a Permit'
    ? (order.building.drawingType === 'As-Built' ? 'As-Built' as const : 'Generic' as const)
    : undefined

  const foundationMap: Record<string, ChecklistInput['foundationType']> = {
    'Concrete': 'Concrete',
    'Level Ground': 'Level Ground',
    'Stem Wall': 'Stem Wall',
    'Mixed': 'Mixed',
  }

  return {
    orderId: order.id ?? order.orderNumber,
    orderNumber: order.orderNumber,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    customerEmail: order.customer.email,
    deliveryAddress: order.customer.deliveryAddress,
    state: order.customer.state,
    foundationType: foundationMap[order.building.foundationType] ?? 'Other',
    permitStatus,
    drawingType,
    manufacturer,
    estimatedDeliveryWeeks: 8,
  }
}
