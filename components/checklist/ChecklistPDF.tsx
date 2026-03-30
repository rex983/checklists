'use client'

import { Document, Page, Text, View, Image, StyleSheet, pdf, Font } from '@react-pdf/renderer'
import { ChecklistContent } from '@/lib/checklist/types'
import { STEP_COLORS } from '@/lib/checklist/colors'

const SUCCESS_TEAM_PHONE = '(813) 692-7320'
const SUCCESS_TEAM_EMAIL = 'SuccessTeam@bigbuildingsdirect.com'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    backgroundColor: '#1a3a5c',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  mfgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    padding: 12,
    marginBottom: 14,
    gap: 12,
  },
  mfgLogo: {
    width: 56,
    height: 56,
    objectFit: 'contain',
  },
  mfgName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a5c',
    marginBottom: 2,
  },
  mfgDetail: {
    fontSize: 9,
    color: '#555',
  },
  greeting: {
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#555',
  },
  orderBadge: {
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  orderBadgeText: {
    fontSize: 9,
    color: '#1a3a5c',
  },
  orderBadgeBold: {
    fontSize: 9,
    color: '#1a3a5c',
    fontFamily: 'Helvetica-Bold',
  },
  stepCard: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '10 16',
    gap: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  stepBody: {
    padding: '12 16',
  },
  paragraph: {
    fontSize: 9.5,
    lineHeight: 1.7,
    color: '#555',
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 9,
    lineHeight: 1.7,
    color: '#1a3a5c',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  footer: {
    marginTop: 8,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 14,
  },
  footerTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 9,
    lineHeight: 1.7,
    color: '#555',
  },
  footerBottom: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  footerBottomText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

const SUCCESS_CONTACT = `Success Team: ${SUCCESS_TEAM_PHONE} | ${SUCCESS_TEAM_EMAIL}`

function ChecklistDocument({ checklist }: { checklist: ChecklistContent }) {
  const drawingLine = checklist.drawingType ? ` • ${checklist.drawingType} Drawings` : ''

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Big Buildings Direct</Text>
          <Text style={styles.headerSub}>Your Next Steps Checklist</Text>
        </View>

        {/* Manufacturer */}
        <View style={styles.mfgRow}>
          {checklist.manufacturer.logoUrl && !checklist.manufacturer.logoUrl.startsWith('data:') && (
            <Image src={checklist.manufacturer.logoUrl} style={styles.mfgLogo} />
          )}
          <View>
            <Text style={styles.mfgName}>{checklist.manufacturer.name}</Text>
            <Text style={styles.mfgDetail}>
              {checklist.manufacturer.contactName} • {checklist.manufacturer.phone}
            </Text>
            <Text style={styles.mfgDetail}>{checklist.manufacturer.email}</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hi {checklist.customerName},
          </Text>
          <Text style={styles.greetingText}>
            Congratulations! Your order {checklist.orderNumber} has been sent to {checklist.manufacturer.name} for fabrication.
            Here's your personalized checklist to get everything ready for delivery and installation.
          </Text>
        </View>

        {/* Order Badge */}
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeBold}>Order: </Text>
          <Text style={styles.orderBadgeText}>{checklist.orderNumber}  •  </Text>
          <Text style={styles.orderBadgeBold}>Foundation: </Text>
          <Text style={styles.orderBadgeText}>{checklist.foundationType}  •  </Text>
          <Text style={styles.orderBadgeBold}>Permit: </Text>
          <Text style={styles.orderBadgeText}>{checklist.permitStatus}{drawingLine}</Text>
        </View>

        {/* Steps */}
        {checklist.steps.map((step, i) => {
          const color = STEP_COLORS[i % STEP_COLORS.length]
          return (
            <View key={step.stepNumber} style={styles.stepCard} wrap={false}>
              <View style={[styles.stepHeader, { backgroundColor: color }]}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <View style={styles.stepBody}>
                {step.paragraphs.map((p, j) => {
                  const isContactLine = p.startsWith('Success Team:')
                  return (
                    <Text key={j} style={isContactLine ? styles.contactLine : styles.paragraph}>
                      {p}
                    </Text>
                  )
                })}
              </View>
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Questions?</Text>
          <Text style={styles.footerText}>
            Contact our Success Team at {SUCCESS_TEAM_PHONE} or {SUCCESS_TEAM_EMAIL}
          </Text>
        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.footerBottomText}>Big Buildings Direct • Customer Checklist</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateChecklistPDF(checklist: ChecklistContent): Promise<Blob> {
  const blob = await pdf(<ChecklistDocument checklist={checklist} />).toBlob()
  return blob
}
