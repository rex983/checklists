import { ChecklistContent } from './types'
import { STEP_COLORS } from './colors'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderChecklistEmail(checklist: ChecklistContent): string {
  const stepsHtml = checklist.steps
    .map((step, i) => {
      const color = STEP_COLORS[i % STEP_COLORS.length]
      const paragraphsHtml = step.paragraphs
        .map(
          (p) =>
            `<p style="margin:0 0 12px;color:#555;font-size:14px;line-height:1.7;">${escapeHtml(p)}</p>`
        )
        .join('\n              ')

      return `
          <!-- Step ${step.stepNumber} -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:${color};padding:16px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;">
                          <span style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:32px;color:#fff;font-weight:700;font-size:14px;">${step.stepNumber}</span>
                        </td>
                        <td>
                          <h2 style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">${escapeHtml(step.title)}</h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px 8px;">
                    ${paragraphsHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    })
    .join('\n')

  const drawingLine = checklist.drawingType
    ? ` &bull; ${escapeHtml(checklist.drawingType)} Drawings`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Big Buildings Direct</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your Next Steps Checklist</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 8px;color:#333;font-size:16px;line-height:1.6;">
                Hi <strong>${escapeHtml(checklist.customerName)}</strong>,
              </p>
              <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.6;">
                Congratulations! Your order <strong style="color:#1a3a5c;">${escapeHtml(checklist.orderNumber)}</strong> has been sent to <strong>${escapeHtml(checklist.manufacturer.name)}</strong> for fabrication.
              </p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Here's your personalized checklist to get everything ready for delivery and installation.
              </p>
            </td>
          </tr>

          <!-- Order Summary Badge -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#f0f4ff;border-radius:8px;padding:14px 20px;font-size:13px;color:#1a3a5c;">
                <strong>Order:</strong> ${escapeHtml(checklist.orderNumber)} &bull;
                <strong>Foundation:</strong> ${escapeHtml(checklist.foundationType)} &bull;
                <strong>Permit:</strong> ${escapeHtml(checklist.permitStatus)}${drawingLine}
              </div>
            </td>
          </tr>

          <!-- Steps -->
${stepsHtml}

          <!-- Contact Footer -->
          <tr>
            <td style="padding:16px 40px 32px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;">
              <p style="margin:0 0 8px;color:#333;font-size:14px;font-weight:600;">Questions?</p>
              <p style="margin:0;color:#555;font-size:13px;line-height:1.7;">
                Contact our <strong>Success Team</strong> at
                <a href="tel:8136927320" style="color:#2563eb;">(813) 692-7320</a> or
                <a href="mailto:SuccessTeam@bigbuildingsdirect.com" style="color:#2563eb;">SuccessTeam@bigbuildingsdirect.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Big Buildings Direct &bull; Customer Checklist
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
