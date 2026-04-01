import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_SECRET = process.env.CHECKLIST_WEBHOOK_SECRET

/**
 * POST /api/checklist/webhook
 *
 * Supabase Database Webhook endpoint.
 * Triggered when an order's status changes to "ready_for_manufacturer".
 *
 * Supabase webhook config:
 *   Table: orders
 *   Events: UPDATE
 *   Filter: status = 'ready_for_manufacturer'
 *   URL: https://your-domain.com/api/checklist/webhook
 *   Headers: { "x-webhook-secret": "<CHECKLIST_WEBHOOK_SECRET>" }
 *
 * The webhook payload contains the full order row.
 * This endpoint maps the order data to ChecklistInput and calls /api/checklist/send.
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  if (WEBHOOK_SECRET) {
    const secret = request.headers.get('x-webhook-secret')
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const payload = await request.json()

    // Supabase webhook sends: { type, table, schema, record, old_record }
    const record = payload.record
    const oldRecord = payload.old_record

    if (!record) {
      return NextResponse.json({ error: 'No record in payload' }, { status: 400 })
    }

    // Only trigger if status just changed TO ready_for_manufacturer
    const statusChanged = oldRecord?.status !== 'ready_for_manufacturer'
      && record.status === 'ready_for_manufacturer'

    if (!statusChanged) {
      return NextResponse.json({ skipped: true, reason: 'Status did not change to ready_for_manufacturer' })
    }

    // Map Order Process order row to ChecklistInput
    // The order row stores customer/building/pricing as JSONB columns
    const customer = typeof record.customer === 'string'
      ? JSON.parse(record.customer)
      : record.customer

    const building = typeof record.building === 'string'
      ? JSON.parse(record.building)
      : record.building

    if (!customer?.email) {
      return NextResponse.json({ error: 'Order has no customer email' }, { status: 400 })
    }

    // Map permittingStructure values to our PermitStatus type
    const permitStatus = building?.permittingStructure === 'No Permit'
      ? 'No Permit'
      : 'Pulling a Permit'

    // Map foundation type (Order Process uses same values)
    const foundationType = building?.foundationType || 'Other'

    // Map drawing type
    const drawingType = permitStatus === 'Pulling a Permit'
      ? (building?.drawingType || 'Generic')
      : undefined

    const checklistInput = {
      orderId: record.id,
      orderNumber: record.order_number,
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      customerEmail: customer.email,
      deliveryAddress: customer.deliveryAddress || '',
      state: customer.state || '',
      foundationType,
      permitStatus,
      drawingType,
      manufacturer: {
        id: building?.manufacturer?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        name: building?.manufacturer || 'Unknown Manufacturer',
        phone: '', // populated from manufacturer_config in production
        email: '',
        contactName: '',
        logoUrl: '',
      },
      estimatedDeliveryWeeks: 8,
    }

    // Call the send endpoint
    const baseUrl = request.nextUrl.origin
    const sendResponse = await fetch(`${baseUrl}/api/checklist/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklistInput),
    })

    const result = await sendResponse.json()

    return NextResponse.json({
      success: true,
      orderNumber: record.order_number,
      ...result,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
