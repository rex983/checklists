import { NextRequest, NextResponse } from 'next/server'
import { ChecklistInput } from '@/lib/checklist/types'
import { generateChecklist } from '@/lib/checklist/engine'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'projects@bigbuildingsdirect.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Big Buildings Direct'

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
  try {
    const input: ChecklistInput = await request.json()

    if (!input.customerName || !input.customerEmail || !input.manufacturer) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, manufacturer' },
        { status: 400 }
      )
    }

    // Generate the checklist
    const checklist = generateChecklist(input)
    const emailHtml = renderChecklistEmail(checklist)

    // If SendGrid is configured, send the email
    if (SENDGRID_API_KEY) {
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
      })

      if (!sgResponse.ok) {
        const errorText = await sgResponse.text()
        console.error('SendGrid error:', errorText)
        return NextResponse.json(
          { error: 'Failed to send email', details: errorText },
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
    console.error('Checklist send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
