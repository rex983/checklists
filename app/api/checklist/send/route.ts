import { NextRequest, NextResponse } from 'next/server'
import { ChecklistInput } from '@/lib/checklist/types'
import { generateChecklist } from '@/lib/checklist/engine'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'
import { validateChecklistInput, sanitizeString } from '@/lib/checklist/validation'
import {
  originMatchesHost,
  verifySharedSecret,
  rateLimit,
  rateLimitResponse,
} from '@/lib/checklist/apiSecurity'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'projects@bigbuildingsdirect.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Big Buildings Direct'
const SEND_SECRET = process.env.CHECKLIST_SEND_SECRET

/**
 * POST /api/checklist/send
 *
 * Generates and sends a checklist email to a customer.
 * Called automatically when an order's status changes to "ready_for_manufacturer"
 * (via Supabase webhook or the order status update flow).
 *
 * Body: ChecklistInput (order + manufacturer data)
 * Returns: { success: true, templateKey, customerEmail }
 */
export async function POST(request: NextRequest) {
  // Rate limit per IP
  const rl = rateLimit(request, 'send', 30)
  if (!rl.ok) return rateLimitResponse(rl.retryAfter)

  // Auth: must either originate from this host (browser, same-origin)
  // OR present a valid shared secret (server-to-server callers).
  const sameOrigin = originMatchesHost(request)
  const hasSecret = verifySharedSecret(request, 'x-checklist-secret', SEND_SECRET)
  if (!sameOrigin && !hasSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const raw = await request.json()

    // Validate input
    const errors = validateChecklistInput(raw)
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    // Construct input explicitly — never spread untrusted data
    const input: ChecklistInput = {
      orderId: sanitizeString(String(raw.orderId || ''), 50),
      orderNumber: sanitizeString(raw.orderNumber || '', 50),
      customerName: sanitizeString(raw.customerName, 100),
      customerEmail: raw.customerEmail.trim().toLowerCase(),
      deliveryAddress: sanitizeString(raw.deliveryAddress || '', 300),
      state: sanitizeString(raw.state || '', 50),
      foundationType: raw.foundationType || 'Other',
      permitStatus: raw.permitStatus || 'No Permit',
      drawingType: raw.drawingType || undefined,
      manufacturer: {
        id: sanitizeString(String(raw.manufacturer?.id || ''), 50),
        name: sanitizeString(String(raw.manufacturer?.name || ''), 100),
        phone: sanitizeString(String(raw.manufacturer?.phone || ''), 30),
        email: sanitizeString(String(raw.manufacturer?.email || ''), 100),
        contactName: sanitizeString(String(raw.manufacturer?.contactName || ''), 100),
        logoUrl: String(raw.manufacturer?.logoUrl || ''),
      },
      estimatedDeliveryWeeks: Number(raw.estimatedDeliveryWeeks) || 8,
    }

    // Generate the checklist
    const checklist = generateChecklist(input)
    const emailHtml = renderChecklistEmail(checklist)

    // If SendGrid is configured, send the email
    if (SENDGRID_API_KEY) {
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
              to: [{ email: input.customerEmail, name: input.customerName }],
            }],
            from: { email: FROM_EMAIL, name: FROM_NAME },
            subject: `Your Next Steps Checklist — Order ${input.orderNumber}`,
            content: [{ type: 'text/html', value: emailHtml }],
          }),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!sgResponse.ok) {
          const errorText = await sgResponse.text()
          console.error('SendGrid error:', errorText)
          return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 502 }
          )
        }
      } catch (fetchError) {
        clearTimeout(timeout)
        console.error('SendGrid fetch error:', fetchError instanceof Error ? fetchError.message : 'unknown')
        return NextResponse.json(
          { error: 'Email service unavailable' },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        sent: true,
        templateKey: checklist.templateKey,
        customerEmail: input.customerEmail,
      })
    }

    // SendGrid not configured — return the generated checklist for preview
    return NextResponse.json({
      success: true,
      sent: false,
      message: 'SendGrid not configured — email not sent (prototype mode)',
      templateKey: checklist.templateKey,
      customerEmail: input.customerEmail,
      checklist,
    })
  } catch (error) {
    console.error('Checklist send error:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
