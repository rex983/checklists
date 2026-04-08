'use client'

import { useEffect, useMemo, useState } from 'react'
import { EditableTemplateBlock } from '@/lib/checklist/templateTypes'
import { buildStepsFromStore, inputToRenderVars } from '@/lib/checklist/templateRenderer'
import {
  ChecklistContent,
  FoundationType,
  PermitStatus,
  DrawingType,
  ManufacturerInfo,
} from '@/lib/checklist/types'
import { renderChecklistEmail } from '@/lib/checklist/emailTemplate'
import { generateChecklistPDF } from '@/components/checklist/ChecklistPDF'
import { STEP_COLORS } from '@/lib/checklist/colors'

type Mode = 'page' | 'email' | 'pdf'

const FOUNDATIONS: FoundationType[] = ['Concrete', 'Asphalt', 'Gravel', 'Level Ground', 'Stem Wall', 'Mixed', 'Other']
const PERMITS: PermitStatus[] = ['No Permit', 'Pulling a Permit']
const DRAWINGS: DrawingType[] = ['Generic', 'As-Built']

const SAMPLE_MFG: ManufacturerInfo = {
  id: 'preview',
  name: 'Sample Manufacturer',
  phone: '(800) 555-0100',
  email: 'orders@example.com',
  contactName: 'Sample Team',
  logoUrl: '',
}

function buildSampleChecklist(
  blocks: EditableTemplateBlock[],
  manufacturer: ManufacturerInfo,
  foundation: FoundationType,
  permit: PermitStatus,
  drawing: DrawingType,
): ChecklistContent {
  const vars = inputToRenderVars({
    customerFirstName: 'Alex',
    customerEmail: 'alex.sample@email.com',
    manufacturer: manufacturer.name,
    estimatedWeeks: 8,
    permitStatus: permit,
    foundationType: foundation,
    drawingType: permit === 'Pulling a Permit' ? drawing : undefined,
  })
  const steps = buildStepsFromStore(vars, blocks)
  return {
    customerName: 'Alex Sample',
    customerEmail: 'alex.sample@email.com',
    orderNumber: 'BBD-PREVIEW-0001',
    manufacturer,
    foundationType: foundation,
    permitStatus: permit,
    drawingType: permit === 'Pulling a Permit' ? drawing : undefined,
    templateKey: 'preview',
    steps,
  }
}

export function TemplatePreview({
  blocks,
  manufacturer,
  onClose,
}: {
  blocks: EditableTemplateBlock[]
  manufacturer?: ManufacturerInfo
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>('page')
  const [foundation, setFoundation] = useState<FoundationType>('Concrete')
  const [permit, setPermit] = useState<PermitStatus>('Pulling a Permit')
  const [drawing, setDrawing] = useState<DrawingType>('Generic')
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfLoading, setPdfLoading] = useState(false)

  const checklist = useMemo(
    () => buildSampleChecklist(blocks, manufacturer ?? SAMPLE_MFG, foundation, permit, drawing),
    [blocks, manufacturer, foundation, permit, drawing],
  )

  const emailHtml = useMemo(() => renderChecklistEmail(checklist), [checklist])

  // Generate PDF blob URL whenever PDF tab is active and inputs change
  useEffect(() => {
    if (mode !== 'pdf') return
    let cancelled = false
    let createdUrl = ''
    setPdfLoading(true)
    generateChecklistPDF(checklist)
      .then((blob) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setPdfUrl(createdUrl)
      })
      .catch(() => {
        if (!cancelled) setPdfUrl('')
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false)
      })
    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [mode, checklist])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl overflow-hidden w-full max-w-[920px] max-h-[92vh] flex flex-col"
        style={{ background: 'var(--card-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--table-border)' }}
        >
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Template Preview{manufacturer ? ` — ${manufacturer.name}` : ''}
            </p>
            <div className="flex gap-1">
              {(['page', 'email', 'pdf'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: mode === m ? '#2563eb' : 'var(--background)',
                    color: mode === m ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {m === 'page' ? 'Page' : m === 'email' ? 'Email' : 'PDF'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-lg leading-none px-2 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            ×
          </button>
        </div>

        {/* Variant Controls */}
        <div
          className="flex flex-wrap gap-3 items-end px-5 py-3 border-b"
          style={{ borderColor: 'var(--table-border)', background: 'var(--background)' }}
        >
          <PreviewSelect
            label="Foundation"
            value={foundation}
            options={FOUNDATIONS}
            onChange={(v) => setFoundation(v as FoundationType)}
          />
          <PreviewSelect
            label="Permit"
            value={permit}
            options={PERMITS}
            onChange={(v) => setPermit(v as PermitStatus)}
          />
          {permit === 'Pulling a Permit' && (
            <PreviewSelect
              label="Drawings"
              value={drawing}
              options={DRAWINGS}
              onChange={(v) => setDrawing(v as DrawingType)}
            />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto" style={{ background: 'var(--background)' }}>
          {mode === 'page' && <PagePreview checklist={checklist} />}
          {mode === 'email' && (
            <iframe
              srcDoc={emailHtml}
              sandbox=""
              title="Email Preview"
              className="w-full border-0"
              style={{ minHeight: '600px', height: '78vh', background: '#f4f6f9' }}
            />
          )}
          {mode === 'pdf' && (
            <div className="w-full h-full" style={{ minHeight: '600px' }}>
              {pdfLoading && (
                <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Generating PDF…
                </p>
              )}
              {!pdfLoading && pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="w-full border-0"
                  style={{ height: '78vh' }}
                />
              )}
              {!pdfLoading && !pdfUrl && (
                <p className="text-center py-12 text-sm" style={{ color: '#ef4444' }}>
                  PDF generation failed.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="min-w-[160px]">
      <label
        className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function PagePreview({ checklist }: { checklist: ChecklistContent }) {
  return (
    <div className="p-6">
      <div
        className="rounded-xl overflow-hidden mx-auto max-w-[760px]"
        style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)' }}
        >
          <p className="text-white text-lg font-bold">Big Buildings Direct</p>
          <p className="text-white/70 text-xs">Your Next Steps Checklist</p>
        </div>

        <div className="p-6">
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {checklist.manufacturer.name}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {checklist.manufacturer.contactName} • {checklist.manufacturer.phone}
          </p>

          <p className="text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            Hi <strong>{checklist.customerName}</strong>
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Your order <strong>{checklist.orderNumber}</strong> has been sent to{' '}
            <strong>{checklist.manufacturer.name}</strong> for fabrication.
          </p>

          <div className="flex flex-col gap-3">
            {checklist.steps.map((step, i) => {
              const color = STEP_COLORS[i % STEP_COLORS.length]
              return (
                <div
                  key={step.stepNumber}
                  className="rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--table-border)' }}
                >
                  <div
                    className="px-4 py-2 flex items-center gap-2"
                    style={{ background: color }}
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-white text-sm font-bold flex-1">
                      Step {step.stepNumber}: {step.title}
                    </span>
                    <span className="text-white/75 text-[11px]">{step.timelineLabel}</span>
                  </div>
                  <div className="px-4 py-3">
                    <div
                      className="rounded-md px-3 py-2 mb-2"
                      style={{ background: `${color}11`, borderLeft: `3px solid ${color}` }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color }}
                      >
                        Your Action
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {step.action}
                      </p>
                    </div>
                    <ul
                      className="list-disc pl-5 text-sm flex flex-col gap-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {step.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
