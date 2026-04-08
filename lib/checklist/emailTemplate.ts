import { ChecklistContent } from './types'
import { STEP_COLORS } from './colors'
import { isSafeUrl } from './validation'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderChecklistEmail(checklist: ChecklistContent, pdfUrl?: string): string {
  const stepsHtml = checklist.steps
    .map((step, i) => {
      const color = STEP_COLORS[i % STEP_COLORS.length]

      const bulletsHtml = step.bullets
        .map(
          (b) =>
            `<li style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">${escapeHtml(b)}</li>`
        )
        .join('\n                    ')

      return `
          <!-- Step ${step.stepNumber} -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:${color};padding:14px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;">
                          <span style="display:inline-block;font-size:22px;line-height:1;">${step.icon}</span>
                        </td>
                        <td>
                          <h2 style="margin:0;color:#ffffff;font-size:15px;font-weight:700;">Step ${step.stepNumber}: ${escapeHtml(step.title)}</h2>
                          <p style="margin:2px 0 0;color:rgba(255,255,255,0.8);font-size:11px;">${escapeHtml(step.timelineLabel)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px 6px;">
                    ${step.action ? `<div style="background:${color}0D;border-left:3px solid ${color};border-radius:4px;padding:10px 14px;margin-bottom:12px;">
                      <p style="margin:0 0 2px;color:${color};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Action</p>
                      <p style="margin:0;color:#333;font-size:14px;font-weight:600;">${escapeHtml(step.action)}</p>
                    </div>` : ''}
                    <ul style="margin:0;padding-left:20px;">
                    ${bulletsHtml}
                    </ul>
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

  const mfgLogoHtml = checklist.manufacturer.logoUrl && isSafeUrl(checklist.manufacturer.logoUrl)
    ? `<img src="${escapeHtml(checklist.manufacturer.logoUrl)}" alt="${escapeHtml(checklist.manufacturer.name)}" style="width:60px;height:60px;object-fit:contain;border-radius:8px;" />`
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
            <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%);padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Big Buildings Direct</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your Next Steps Checklist</p>
            </td>
          </tr>

          <!-- Manufacturer + Greeting -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  ${mfgLogoHtml ? `<td style="width:72px;padding-right:14px;vertical-align:middle;">${mfgLogoHtml}</td>` : ''}
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:#1a3a5c;">${escapeHtml(checklist.manufacturer.name)}</p>
                    <p style="margin:0;font-size:12px;color:#555;">${escapeHtml(checklist.manufacturer.contactName)} &bull; ${escapeHtml(checklist.manufacturer.phone)}</p>
                    <p style="margin:0;font-size:12px;color:#555;">${escapeHtml(checklist.manufacturer.email)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;color:#333;font-size:16px;line-height:1.5;">
                Hi <strong>${escapeHtml(checklist.customerName)}</strong> 👋
              </p>
              <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.5;">
                Congratulations! Your order <strong style="color:#1a3a5c;">${escapeHtml(checklist.orderNumber)}</strong> has been sent to <strong>${escapeHtml(checklist.manufacturer.name)}</strong> for fabrication. Follow these 4 steps to get ready:
              </p>
            </td>
          </tr>

          <!-- Order Summary Badge -->
          <tr>
            <td style="padding:0 40px 20px;">
              <div style="background:#f0f4ff;border-radius:8px;padding:12px 18px;font-size:12px;color:#1a3a5c;">
                <strong>Order:</strong> ${escapeHtml(checklist.orderNumber)} &bull;
                <strong>Foundation:</strong> ${escapeHtml(checklist.foundationType)} &bull;
                <strong>Permit:</strong> ${escapeHtml(checklist.permitStatus)}${drawingLine}
              </div>
            </td>
          </tr>

          <!-- Steps -->
${stepsHtml}

          <!-- Download PDF Button -->
          <tr>
            <td style="padding:8px 40px 24px;text-align:center;">
              <a href="${pdfUrl || '#'}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
                📄 Download Printable PDF
              </a>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;">Save or print your checklist for easy reference</p>
            </td>
          </tr>

          <!-- Contact Footer -->
          <tr>
            <td style="padding:8px 40px 28px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;">
              <p style="margin:0 0 6px;color:#333;font-size:14px;font-weight:600;">Questions? We're here to help!</p>
              <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
                Contact our <strong>Success Team</strong> at
                <a href="tel:8136927320" style="color:#2563eb;font-weight:600;">(813) 692-7320</a> or
                <a href="mailto:SuccessTeam@bigbuildingsdirect.com" style="color:#2563eb;font-weight:600;">SuccessTeam@bigbuildingsdirect.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
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
