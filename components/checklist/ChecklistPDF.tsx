'use client'

import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer'
import { ChecklistContent } from '@/lib/checklist/types'
import { STEP_COLORS } from '@/lib/checklist/colors'

const SUCCESS_TEAM_PHONE = '(813) 692-7320'
const SUCCESS_TEAM_EMAIL = 'SuccessTeam@bigbuildingsdirect.com'

const s = StyleSheet.create({
  page: {
    padding: '24 28',
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#333',
  },
  // Header — compact single row
  header: {
    backgroundColor: '#1a3a5c',
    borderRadius: 4,
    padding: '8 14',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8,
  },
  // Manufacturer + order info in one row
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  mfgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '0.5px solid #e2e8f0',
    padding: '6 8',
    flex: 1,
    gap: 8,
  },
  mfgLogo: {
    width: 36,
    height: 36,
    objectFit: 'contain',
  },
  mfgName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a5c',
  },
  mfgDetail: {
    fontSize: 7,
    color: '#555',
  },
  orderBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 4,
    padding: '6 8',
    flex: 1,
    justifyContent: 'center',
  },
  orderLabel: {
    fontSize: 7,
    color: '#1a3a5c',
    fontFamily: 'Helvetica-Bold',
  },
  orderVal: {
    fontSize: 7,
    color: '#1a3a5c',
  },
  // Greeting — 2 lines max
  greeting: {
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#444',
  },
  greetingBold: {
    fontFamily: 'Helvetica-Bold',
  },
  // Steps
  stepCard: {
    borderRadius: 4,
    border: '0.5px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: 5,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '4 8',
    gap: 6,
  },
  stepNum: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  stepTitle: {
    color: '#fff',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
  },
  stepBody: {
    padding: '5 8 4',
  },
  para: {
    fontSize: 7.5,
    lineHeight: 1.45,
    color: '#555',
    marginBottom: 3,
  },
  contactLine: {
    fontSize: 7,
    lineHeight: 1.3,
    color: '#1a3a5c',
    fontFamily: 'Helvetica-Bold',
    marginTop: 1,
  },
  // Footer
  footer: {
    marginTop: 'auto',
    borderTop: '0.5px solid #e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontSize: 7,
    color: '#555',
  },
  footerBold: {
    fontSize: 7,
    color: '#1a3a5c',
    fontFamily: 'Helvetica-Bold',
  },
  footerRight: {
    fontSize: 6.5,
    color: '#94a3b8',
  },
})

function ChecklistDocument({ checklist }: { checklist: ChecklistContent }) {
  const drawingLine = checklist.drawingType ? ` | ${checklist.drawingType} Drawings` : ''

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Big Buildings Direct</Text>
          <Text style={s.headerSub}>Customer Checklist</Text>
        </View>

        {/* Manufacturer + Order Info side by side */}
        <View style={s.infoRow}>
          <View style={s.mfgBox}>
            {checklist.manufacturer.logoUrl && !checklist.manufacturer.logoUrl.startsWith('data:') && (
              <Image src={checklist.manufacturer.logoUrl} style={s.mfgLogo} />
            )}
            <View>
              <Text style={s.mfgName}>{checklist.manufacturer.name}</Text>
              <Text style={s.mfgDetail}>{checklist.manufacturer.contactName} | {checklist.manufacturer.phone}</Text>
              <Text style={s.mfgDetail}>{checklist.manufacturer.email}</Text>
            </View>
          </View>
          <View style={s.orderBox}>
            <Text style={s.orderLabel}>Order: <Text style={s.orderVal}>{checklist.orderNumber}</Text></Text>
            <Text style={s.orderLabel}>Foundation: <Text style={s.orderVal}>{checklist.foundationType}</Text></Text>
            <Text style={s.orderLabel}>Permit: <Text style={s.orderVal}>{checklist.permitStatus}{drawingLine}</Text></Text>
          </View>
        </View>

        {/* Greeting — condensed */}
        <View style={s.greeting}>
          <Text style={s.greetingText}>
            Hi <Text style={s.greetingBold}>{checklist.customerName}</Text> — Your order <Text style={s.greetingBold}>{checklist.orderNumber}</Text> has been sent to <Text style={s.greetingBold}>{checklist.manufacturer.name}</Text> for fabrication. Here are your next steps:
          </Text>
        </View>

        {/* Steps */}
        {checklist.steps.map((step, i) => {
          const color = STEP_COLORS[i % STEP_COLORS.length]
          // Filter out the "Success Team:" contact line — we show it once at bottom
          const paragraphs = step.paragraphs.filter(p => !p.startsWith('Success Team:'))
          return (
            <View key={step.stepNumber} style={s.stepCard}>
              <View style={[s.stepHeader, { backgroundColor: color }]}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{step.stepNumber}</Text>
                </View>
                <Text style={s.stepTitle}>{step.title}</Text>
              </View>
              <View style={s.stepBody}>
                {paragraphs.map((p, j) => (
                  <Text key={j} style={s.para}>{p}</Text>
                ))}
              </View>
            </View>
          )
        })}

        {/* Footer — single contact line */}
        <View style={s.footer}>
          <View>
            <Text style={s.footerLeft}>
              Questions? Contact <Text style={s.footerBold}>Success Team: {SUCCESS_TEAM_PHONE}</Text> | <Text style={s.footerBold}>{SUCCESS_TEAM_EMAIL}</Text>
            </Text>
          </View>
          <Text style={s.footerRight}>Big Buildings Direct</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateChecklistPDF(checklist: ChecklistContent): Promise<Blob> {
  const blob = await pdf(<ChecklistDocument checklist={checklist} />).toBlob()
  return blob
}
