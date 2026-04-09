import { NextRequest, NextResponse } from 'next/server'
import { generateChecklist } from '@/lib/checklist/engine'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'
import { validateEmail, sanitizeString, isValidFoundationType } from '@/lib/checklist/validation'
import { verifySharedSecret, rateLimit, rateLimitResponse } from '@/lib/checklist/apiSecurity'

const WEBHOOK_SECRET = process.env.CHECKLIST_WEBHOOK_SECRET
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'projects@bigbuildingsdirect.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Big Buildings Direct'

/**
 * POST /api/checklist/webhook
 *
 * Supabase Database Webhook endpoint.
 * Triggered when an order's status changes to "ready_for_manufacturer".
 *
 * Authentication: REQUIRED via x-webhook-secret header.
 *
 * Supabase webhook config:
 *   Table: orders
 *   Events: UPDATE
 *   Filter: status = 'ready_for_manufacturer'
 *   URL: https://your-domain.com/api/checklist/webhook
 *   Headers: { "x-webhook-secret": "<CHECKLIST_WEBHOOK_SECRET>" }
 */
export async function POST(request: NextRequest) {
  // Rate limit per IP
  const rl = rateLimit(request, 'webhook', 60)
  if (!rl.ok) return rateLimitResponse(rl.retryAfter)

  // Mandatory webhook authentication (constant-time)
  if (!WEBHOOK_SECRET) {
    console.error('CHECKLIST_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  if (!verifySharedSecret(request, 'x-webhook-secret', WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()

    // Supabase webhook sends: { type, table, schema, record, old_record }
    const record = payload?.record
    const oldRecord = payload?.old_record

    if (!record || typeof record !== 'object') {
      return NextResponse.json({ error: 'Invalid payload: missing record' }, { status: 400 })
    }

    // Only trigger if status just changed TO ready_for_manufacturer
    const statusChanged = oldRecord?.status !== 'ready_for_manufacturer'
      && record.status === 'ready_for_manufacturer'

    if (!statusChanged) {
      return NextResponse.json({ skipped: true, reason: 'Status did not change to ready_for_manufacturer' })
    }

    // Parse and validate customer JSONB
    const customer = typeof record.customer === 'string'
      ? JSON.parse(record.customer)
      : record.customer

    if (!customer || typeof customer !== 'object') {
      return NextResponse.json({ error: 'Invalid customer data' }, { status: 400 })
    }

    if (!customer.firstName || !customer.lastName || !customer.email) {
      return NextResponse.json({ error: 'Incomplete customer data: need firstName, lastName, email' }, { status: 400 })
    }

    if (!validateEmail(customer.email)) {
      return NextResponse.json({ error: 'Invalid customer email' }, { status: 400 })
    }

    // Parse and validate building JSONB
    const building = typeof record.building === 'string'
      ? JSON.parse(record.building)
      : record.building

    if (!building || typeof building !== 'object') {
      return NextResponse.json({ error: 'Invalid building data' }, { status: 400 })
    }

    // Map and validate fields
    const permitStatus = building.permittingStructure === 'No Permit'
      ? 'No Permit' as const
      : 'Pulling a Permit' as const

    const rawFoundation = building.foundationType || 'Other'
    const foundationType = isValidFoundationType(rawFoundation) ? rawFoundation : 'Other' as const

    const rawDrawing = building.drawingType || 'Generic'
    const drawingType = permitStatus === 'Pulling a Permit'
      ? (rawDrawing === 'As-Built' ? 'As-Built' as const : 'Generic' as const)
      : undefined

    const checklistInput = {
      orderId: String(record.id || ''),
      orderNumber: sanitizeString(String(record.order_number || ''), 50),
      customerName: sanitizeString(`${customer.firstName} ${customer.lastName}`.trim(), 100),
      customerEmail: customer.email.trim().toLowerCase(),
      deliveryAddress: sanitizeString(customer.deliveryAddress || '', 300),
      state: sanitizeString(customer.state || '', 50),
      foundationType,
      permitStatus,
      drawingType,
      manufacturer: {
        id: sanitizeString((building.manufacturer || 'unknown').toLowerCase().replace(/\s+/g, '-'), 50),
        name: sanitizeString(building.manufacturer || 'Unknown Manufacturer', 100),
        phone: '',
        email: '',
        contactName: '',
        logoUrl: '',
      },
      estimatedDeliveryWeeks: 8,
    }

    // Generate checklist and send email directly (no internal fetch — avoids SSRF)
    const checklist = generateChecklist(checklistInput)

    if (SENDGRID_API_KEY) {
      const emailHtml = renderChecklistEmail(checklist)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      try {
        const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: checklistInput.customerEmail, name: checklistInput.customerName }],
            }],
            from: { email: FROM_EMAIL, name: FROM_NAME },
            subject: `Your Project Checklist — Order ${checklistInput.orderNumber}`,
            content: [{ type: 'text/html', value: emailHtml }],
          }),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!sgResponse.ok) {
          console.error('SendGrid error in webhook')
          return NextResponse.json({ error: 'Failed to send email' }, { status: 502 })
        }
      } catch {
        clearTimeout(timeout)
        return NextResponse.json({ error: 'Email service unavailable' }, { status: 502 })
      }
    }

    return NextResponse.json({
      success: true,
      sent: !!SENDGRID_API_KEY,
      orderNumber: checklistInput.orderNumber,
      templateKey: checklist.templateKey,
      customerEmail: checklistInput.customerEmail,
    })
  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
