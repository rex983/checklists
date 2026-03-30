'use client'

import { useState, useMemo, useEffect } from 'react'
import { getDefaultOrders } from '@/lib/checklist/mockData'
import { loadManufacturers } from '@/lib/checklist/manufacturerStore'
import { generateChecklist } from '@/lib/checklist/engine'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'
import { ChecklistContent, ChecklistStep, FoundationType, PermitStatus, DrawingType, ManufacturerInfo } from '@/lib/checklist/types'
import { STEP_COLORS } from '@/lib/checklist/colors'
import { useToast } from '@/components/checklist/Toast'
/* eslint-disable @next/next/no-img-element */
import { generateChecklistPDF } from '@/components/checklist/ChecklistPDF'

const FOUNDATION_TYPES: FoundationType[] = ['Concrete', 'Level Ground', 'Stem Wall', 'Mixed', 'Other']
const PERMIT_STATUSES: PermitStatus[] = ['No Permit', 'Pulling a Permit']
const DRAWING_TYPES: DrawingType[] = ['Generic', 'As-Built']

const STEP_ICONS: Record<number, string> = {
  1: '/icons/permit.svg',
  2: '/icons/landprep.svg',
  3: '/icons/delivery.svg',
  4: '/icons/install.svg',
}

export function ChecklistDashboard() {
  const [manufacturers, setManufacturers] = useState<ManufacturerInfo[]>([])
  const [mockOrders, setMockOrders] = useState(() => getDefaultOrders([]))
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [foundationOverride, setFoundationOverride] = useState<FoundationType | null>(null)
  const [permitOverride, setPermitOverride] = useState<PermitStatus | null>(null)
  const [drawingOverride, setDrawingOverride] = useState<DrawingType | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
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

  const emailHtml = useMemo(
    () => (showEmailModal && checklist) ? renderChecklistEmail(checklist) : '',
    [checklist, showEmailModal]
  )

  const hasOverrides = foundationOverride !== null || permitOverride !== null || drawingOverride !== null

  // Reset checked items when order/overrides change
  useEffect(() => {
    setCheckedItems(new Set())
    setExpandedSteps(new Set([1, 2, 3, 4]))
  }, [effectiveOrder])

  if (!baseOrder || !checklist) return null

  function handleOrderChange(orderId: string) {
    setSelectedOrderId(orderId)
    setFoundationOverride(null)
    setPermitOverride(null)
    setDrawingOverride(null)
  }

  function toggleStep(stepNum: number) {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepNum)) next.delete(stepNum)
      else next.add(stepNum)
      return next
    })
  }

  function toggleCheck(key: string) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Calculate progress
  const totalItems = checklist.steps.reduce((sum, s) => sum + s.bullets.length, 0)
  const completedItems = checkedItems.size
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

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
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Select Order
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
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
        <div className="border-t pt-4 flex flex-wrap gap-4" style={{ borderColor: 'var(--table-border)' }}>
          <OverrideSelect label="Foundation Type" value={foundationOverride ?? baseOrder.foundationType} options={FOUNDATION_TYPES} isOverridden={foundationOverride !== null} onChange={(v) => setFoundationOverride(v as FoundationType)} />
          <OverrideSelect label="Permit Status" value={permitOverride ?? baseOrder.permitStatus} options={PERMIT_STATUSES} isOverridden={permitOverride !== null} onChange={(v) => setPermitOverride(v as PermitStatus)} />
          {checklist.permitStatus === 'Pulling a Permit' && (
            <OverrideSelect label="Drawing Type" value={drawingOverride ?? baseOrder.drawingType ?? 'Generic'} options={DRAWING_TYPES} isOverridden={drawingOverride !== null} onChange={(v) => setDrawingOverride(v as DrawingType)} />
          )}
          {hasOverrides && (
            <button onClick={() => { setFoundationOverride(null); setPermitOverride(null); setDrawingOverride(null) }} className="self-end px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ color: '#2563eb' }}>
              Reset to order defaults
            </button>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}>

        {/* Manufacturer Info + Greeting */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-5 mb-5">
            {checklist.manufacturer.logoUrl && (
              <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white flex items-center justify-center border-2" style={{ borderColor: 'var(--table-border)' }}>
                <img src={checklist.manufacturer.logoUrl} alt={checklist.manufacturer.name} className="object-contain w-full h-full p-2" />
              </div>
            )}
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{checklist.manufacturer.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{checklist.manufacturer.contactName} &bull; {checklist.manufacturer.phone}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{checklist.manufacturer.email}</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              Hi <strong>{checklist.customerName}</strong> 👋
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Congratulations! Your order <strong>{checklist.orderNumber}</strong> has been sent to{' '}
              <strong>{checklist.manufacturer.name}</strong> for fabrication. Follow these 4 steps to get ready:
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Your Progress</span>
              <span className="text-xs font-bold" style={{ color: progressPct === 100 ? '#059669' : '#2563eb' }}>
                {progressPct}% Complete
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? 'linear-gradient(90deg, #059669, #10b981)'
                    : 'linear-gradient(90deg, #2563eb, #7c3aed)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="px-6 py-4">
          <div className="flex items-stretch gap-1">
            {checklist.steps.map((step, i) => {
              const color = STEP_COLORS[i % STEP_COLORS.length]
              const stepBullets = step.bullets.map((_, j) => `${step.stepNumber}-${j}`)
              const stepComplete = stepBullets.every(k => checkedItems.has(k))
              return (
                <div key={step.stepNumber} className="flex-1 text-center">
                  <div
                    className="h-2 rounded-full mb-2 transition-all duration-300"
                    style={{ background: stepComplete ? color : `${color}33` }}
                  />
                  <div className="text-2xl mb-0.5">{step.icon}</div>
                  <p className="text-[10px] font-semibold leading-tight" style={{ color: stepComplete ? color : 'var(--text-secondary)' }}>
                    {step.title.split('—')[0].trim()}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {step.timelineLabel}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Accordion Cards */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {checklist.steps.map((step, i) => (
            <StepAccordion
              key={step.stepNumber}
              step={step}
              color={STEP_COLORS[i % STEP_COLORS.length]}
              expanded={expandedSteps.has(step.stepNumber)}
              onToggle={() => toggleStep(step.stepNumber)}
              checkedItems={checkedItems}
              onToggleCheck={toggleCheck}
            />
          ))}
        </div>

        {/* Success Team Footer */}
        <div
          className="px-6 py-4 border-t text-center"
          style={{ borderColor: 'var(--table-border)', background: 'var(--background)' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Questions? We&apos;re here to help!
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Success Team:</strong>{' '}
            <span style={{ color: '#2563eb' }}>(813) 692-7320</span> &bull;{' '}
            <span style={{ color: '#2563eb' }}>SuccessTeam@bigbuildingsdirect.com</span>
          </p>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowEmailModal(false)}>
          <div className="rounded-xl overflow-hidden w-full max-w-[680px] max-h-[90vh] flex flex-col" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--table-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email Preview — {checklist.customerEmail}</p>
              <button onClick={() => setShowEmailModal(false)} className="text-lg leading-none px-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>×</button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe srcDoc={emailHtml} title="Email Preview" className="w-full border-0" style={{ minHeight: '600px', height: '75vh' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Accordion Step Card ── */
function StepAccordion({ step, color, expanded, onToggle, checkedItems, onToggleCheck }: {
  step: ChecklistStep
  color: string
  expanded: boolean
  onToggle: () => void
  checkedItems: Set<string>
  onToggleCheck: (key: string) => void
}) {
  const stepBullets = step.bullets.map((_, j) => `${step.stepNumber}-${j}`)
  const checkedCount = stepBullets.filter(k => checkedItems.has(k)).length
  const allDone = checkedCount === step.bullets.length

  return (
    <div className="rounded-xl border overflow-hidden transition-shadow" style={{ borderColor: allDone ? `${color}66` : 'var(--table-border)', boxShadow: allDone ? `0 0 0 1px ${color}33` : 'none' }}>
      {/* Header — clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left transition-colors"
        style={{ background: expanded ? color : `${color}11` }}
      >
        <span className="text-2xl flex-shrink-0" style={{ filter: expanded ? 'none' : 'grayscale(0)' }}>
          {step.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${expanded ? 'text-white' : ''}`} style={expanded ? {} : { color: 'var(--text-primary)' }}>
              Step {step.stepNumber}: {step.title}
            </span>
            {allDone && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium" style={expanded ? {} : { background: `${color}22`, color }}>
                Done!
              </span>
            )}
          </div>
          {!expanded && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {step.action}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!expanded && (
            <span className="text-xs font-medium" style={{ color: expanded ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
              {checkedCount}/{step.bullets.length}
            </span>
          )}
          <span className={`text-sm transition-transform ${expanded ? 'rotate-180 text-white' : ''}`} style={expanded ? {} : { color: 'var(--text-secondary)' }}>
            ▼
          </span>
        </div>
      </button>

      {/* Body — collapsible */}
      {expanded && (
        <div className="px-4 py-4">
          {/* Action Callout */}
          <div
            className="rounded-lg px-4 py-3 mb-4 flex items-start gap-3"
            style={{ background: `${color}0D`, borderLeft: `3px solid ${color}` }}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">👉</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color }}>
                Your Action
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {step.action}
              </p>
            </div>
          </div>

          {/* Checkbox Bullets */}
          <div className="flex flex-col gap-2">
            {step.bullets.map((bullet, j) => {
              const key = `${step.stepNumber}-${j}`
              const checked = checkedItems.has(key)
              return (
                <label
                  key={j}
                  className="flex items-start gap-3 cursor-pointer group rounded-lg px-3 py-2 -mx-1 transition-colors"
                  style={{ background: checked ? '#f0fdf4' : 'transparent' }}
                >
                  <span
                    className="mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: checked ? '#059669' : 'var(--input-border)',
                      background: checked ? '#059669' : 'transparent',
                    }}
                    onClick={(e) => { e.preventDefault(); onToggleCheck(key) }}
                  >
                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                  </span>
                  <span
                    className="text-sm leading-relaxed transition-colors"
                    style={{
                      color: checked ? '#059669' : 'var(--text-secondary)',
                      textDecoration: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.7 : 1,
                    }}
                    onClick={() => onToggleCheck(key)}
                  >
                    {bullet}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Override Select ── */
function OverrideSelect({ label, value, options, isOverridden, onChange }: {
  label: string; value: string; options: readonly string[]; isOverridden: boolean; onChange: (value: string) => void
}) {
  return (
    <div className="min-w-[180px]">
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{ background: 'var(--input-bg)', borderColor: isOverridden ? '#2563eb' : 'var(--input-border)', color: 'var(--text-primary)' }}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}
