'use client'

import { useState, useMemo, useEffect } from 'react'
import { getDefaultOrders } from '@/lib/checklist/mockData'
import { loadManufacturers } from '@/lib/checklist/manufacturerStore'
import { generateChecklist } from '@/lib/checklist/engine'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'
import { ChecklistContent, FoundationType, PermitStatus, DrawingType, ManufacturerInfo } from '@/lib/checklist/types'
import { STEP_COLORS } from '@/lib/checklist/colors'
import { useToast } from '@/components/checklist/Toast'
import Image from 'next/image'
import { generateChecklistPDF } from '@/components/checklist/ChecklistPDF'

const FOUNDATION_TYPES: FoundationType[] = ['Concrete', 'Level Ground', 'Stem Wall', 'Mixed', 'Other']
const PERMIT_STATUSES: PermitStatus[] = ['No Permit', 'Pulling a Permit']
const DRAWING_TYPES: DrawingType[] = ['Generic', 'As-Built']

export function ChecklistDashboard() {
  const [manufacturers, setManufacturers] = useState<ManufacturerInfo[]>([])
  const [mockOrders, setMockOrders] = useState(() => getDefaultOrders([]))
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [foundationOverride, setFoundationOverride] = useState<FoundationType | null>(null)
  const [permitOverride, setPermitOverride] = useState<PermitStatus | null>(null)
  const [drawingOverride, setDrawingOverride] = useState<DrawingType | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const mfgs = loadManufacturers()
    setManufacturers(mfgs)
    const orders = getDefaultOrders(mfgs)
    setMockOrders(orders)
    setSelectedOrderId(orders[0]?.orderId ?? '')
  }, [])

  const baseOrder = mockOrders.find((o) => o.orderId === selectedOrderId) ?? null

  const effectiveOrder = useMemo(() => {
    if (!baseOrder) return null
    const foundation = foundationOverride ?? baseOrder.foundationType
    const permit = permitOverride ?? baseOrder.permitStatus
    const drawing = permit === 'No Permit'
      ? undefined
      : (drawingOverride ?? baseOrder.drawingType ?? 'Generic')

    return { ...baseOrder, foundationType: foundation, permitStatus: permit, drawingType: drawing }
  }, [baseOrder, foundationOverride, permitOverride, drawingOverride])

  const checklist: ChecklistContent | null = useMemo(
    () => effectiveOrder ? generateChecklist(effectiveOrder) : null,
    [effectiveOrder]
  )

  // Defer email HTML generation until modal is actually open
  const emailHtml = useMemo(
    () => (showEmailModal && checklist) ? renderChecklistEmail(checklist) : '',
    [checklist, showEmailModal]
  )

  const hasOverrides = foundationOverride !== null || permitOverride !== null || drawingOverride !== null

  if (!baseOrder || !checklist) return null

  function handleOrderChange(orderId: string) {
    setSelectedOrderId(orderId)
    setFoundationOverride(null)
    setPermitOverride(null)
    setDrawingOverride(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Customer Checklist
        </h1>
        <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#fff3e0] text-[#e65100]">
          Prototype — Mock Data
        </span>
      </div>

      {/* Controls */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}
      >
        {/* Order selector + actions row */}
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Select Order
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
              }}
            >
              {mockOrders.map((order) => (
                <option key={order.orderId} value={order.orderId}>
                  {order.orderNumber} — {order.customerName} ({order.foundationType}, {order.permitStatus}
                  {order.drawingType ? `, ${order.drawingType}` : ''})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)' }}
            >
              Preview Email
            </button>
            <button
              onClick={async () => {
                showToast('Generating PDF...', 'info')
                try {
                  const blob = await generateChecklistPDF(checklist)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `Checklist-${checklist.orderNumber}.pdf`
                  a.click()
                  URL.revokeObjectURL(url)
                  showToast('PDF downloaded!', 'success')
                } catch {
                  showToast('PDF generation failed', 'error')
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
              style={{ background: '#059669' }}
            >
              Download PDF
            </button>
            <button
              onClick={() => showToast(`Email would be sent to ${checklist.customerEmail}`, 'info')}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors opacity-60 cursor-not-allowed"
              style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}
              disabled
            >
              Send Email
            </button>
          </div>
        </div>

        {/* Decision variable overrides */}
        <div
          className="border-t pt-4 flex flex-wrap gap-4"
          style={{ borderColor: 'var(--table-border)' }}
        >
          <OverrideSelect
            label="Foundation Type"
            value={foundationOverride ?? baseOrder.foundationType}
            options={FOUNDATION_TYPES}
            isOverridden={foundationOverride !== null}
            onChange={(v) => setFoundationOverride(v as FoundationType)}
          />
          <OverrideSelect
            label="Permit Status"
            value={permitOverride ?? baseOrder.permitStatus}
            options={PERMIT_STATUSES}
            isOverridden={permitOverride !== null}
            onChange={(v) => setPermitOverride(v as PermitStatus)}
          />
          {checklist.permitStatus === 'Pulling a Permit' && (
            <OverrideSelect
              label="Drawing Type"
              value={drawingOverride ?? baseOrder.drawingType ?? 'Generic'}
              options={DRAWING_TYPES}
              isOverridden={drawingOverride !== null}
              onChange={(v) => setDrawingOverride(v as DrawingType)}
            />
          )}
          {hasOverrides && (
            <button
              onClick={() => { setFoundationOverride(null); setPermitOverride(null); setDrawingOverride(null) }}
              className="self-end px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{ color: '#2563eb' }}
            >
              Reset to order defaults
            </button>
          )}
        </div>
      </div>

      {/* Template Resolution Info */}
      <div
        className="rounded-xl p-4 mb-6 text-sm"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}
      >
        <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Resolved Template
        </p>
        <div className="flex flex-wrap gap-3">
          <Tag label="Foundation" value={checklist.foundationType} />
          <Tag label="Permit" value={checklist.permitStatus} />
          {checklist.drawingType && <Tag label="Drawing" value={checklist.drawingType} />}
          <Tag label="Template Key" value={checklist.templateKey} />
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--table-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Checklist Preview
          </p>
        </div>
        <div className="p-5">
          {/* Manufacturer Info */}
          <div
            className="flex items-center gap-4 rounded-lg p-4 mb-5"
            style={{ background: 'var(--background)' }}
          >
            {checklist.manufacturer.logoUrl && (
              <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white flex items-center justify-center border-2" style={{ borderColor: 'var(--table-border)' }}>
                <Image
                  src={checklist.manufacturer.logoUrl}
                  alt={checklist.manufacturer.name}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full p-2"
                  unoptimized
                />
              </div>
            )}
            <div style={{ color: 'var(--text-secondary)' }}>
              <p className="font-bold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {checklist.manufacturer.name}
              </p>
              <p className="text-sm">{checklist.manufacturer.contactName} &bull; {checklist.manufacturer.phone}</p>
              <p className="text-sm">{checklist.manufacturer.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Hi <strong>{checklist.customerName}</strong>,
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your order <strong>{checklist.orderNumber}</strong> has been sent to{' '}
              <strong>{checklist.manufacturer.name}</strong> for fabrication. Here are your next steps:
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {checklist.steps.map((step) => (
              <StepCard key={step.stepNumber} step={step} />
            ))}
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="rounded-xl overflow-hidden w-full max-w-[680px] max-h-[90vh] flex flex-col"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--table-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Email Preview — {checklist.customerEmail}
              </p>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-lg leading-none px-2 cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                srcDoc={emailHtml}
                title="Email Preview"
                className="w-full border-0"
                style={{ minHeight: '600px', height: '75vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverrideSelect({ label, value, options, isOverridden, onChange }: {
  label: string
  value: string
  options: readonly string[]
  isOverridden: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-[180px]">
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{
          background: 'var(--input-bg)',
          borderColor: isOverridden ? '#2563eb' : 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function StepCard({ step }: { step: { stepNumber: number; title: string; icon: string; paragraphs: string[] } }) {
  const color = STEP_COLORS[(step.stepNumber - 1) % STEP_COLORS.length]

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--table-border)' }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: color }}>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {step.stepNumber}
        </span>
        <span className="text-sm font-semibold text-white">{step.title}</span>
      </div>
      <div className="p-4">
        {step.paragraphs.map((p, i) => (
          <p key={i} className="text-sm mb-2 last:mb-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
      style={{ background: 'var(--background)', color: 'var(--text-primary)' }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  )
}
