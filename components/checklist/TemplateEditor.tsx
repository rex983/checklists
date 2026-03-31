'use client'

import { useState, useEffect, useRef } from 'react'
import { EditableTemplateBlock, BulletItem, TEMPLATE_VARIABLES, STEP_CATEGORIES } from '@/lib/checklist/templateTypes'
import { loadTemplateBlocks, saveTemplateBlocks, getDefaultTemplateBlocks } from '@/lib/checklist/templateStore'
import { useToast } from '@/components/checklist/Toast'

type StepCategory = 'permit' | 'landprep' | 'scheduling' | 'installation'

export function TemplateEditor() {
  const [blocks, setBlocks] = useState<EditableTemplateBlock[]>([])
  const [activeTab, setActiveTab] = useState<StepCategory>('permit')
  const [activeBlockId, setActiveBlockId] = useState<string>('')
  const { showToast } = useToast()

  useEffect(() => {
    const loaded = loadTemplateBlocks()
    setBlocks(loaded)
    const firstBlock = loaded.find(b => b.stepCategory === 'permit')
    if (firstBlock) setActiveBlockId(firstBlock.id)
  }, [])

  const tabBlocks = blocks.filter(b => b.stepCategory === activeTab)
  const activeBlock = blocks.find(b => b.id === activeBlockId)

  function handleTabChange(tab: StepCategory) {
    setActiveTab(tab)
    const first = blocks.find(b => b.stepCategory === tab)
    if (first) setActiveBlockId(first.id)
  }

  function updateBlock(updated: EditableTemplateBlock) {
    const next = blocks.map(b => b.id === updated.id ? updated : b)
    setBlocks(next)
    saveTemplateBlocks(next)
  }

  function resetBlock(blockId: string) {
    const defaults = getDefaultTemplateBlocks()
    const defaultBlock = defaults.find(b => b.id === blockId)
    if (!defaultBlock) return
    const next = blocks.map(b => b.id === blockId ? defaultBlock : b)
    setBlocks(next)
    saveTemplateBlocks(next)
    showToast('Block reset to default', 'info')
  }

  function resetAll() {
    const defaults = getDefaultTemplateBlocks()
    setBlocks(defaults)
    saveTemplateBlocks(defaults)
    showToast('All templates reset to defaults', 'info')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Template Editor
        </h1>
        <button
          onClick={resetAll}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer"
          style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}
        >
          Reset All Defaults
        </button>
      </div>

      {/* Step Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {STEP_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleTabChange(cat.key)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
            style={{
              background: activeTab === cat.key ? 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)' : 'var(--bg-card)',
              color: activeTab === cat.key ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab !== cat.key ? 'var(--card-shadow)' : 'none',
            }}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Variant Selector (for steps with multiple blocks) */}
      {tabBlocks.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tabBlocks.map(block => (
            <button
              key={block.id}
              onClick={() => setActiveBlockId(block.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                background: activeBlockId === block.id ? '#2563eb' : 'var(--bg-card)',
                color: activeBlockId === block.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: activeBlockId !== block.id ? 'var(--card-shadow)' : 'none',
              }}
            >
              {block.variantLabel}
            </button>
          ))}
        </div>
      )}

      {/* Block Editor */}
      {activeBlock && (
        <BlockEditor
          block={activeBlock}
          onChange={updateBlock}
          onReset={() => resetBlock(activeBlock.id)}
        />
      )}
    </div>
  )
}

/* ── Block Editor ── */
function BlockEditor({ block, onChange, onReset }: {
  block: EditableTemplateBlock
  onChange: (block: EditableTemplateBlock) => void
  onReset: () => void
}) {
  function updateField<K extends keyof EditableTemplateBlock>(field: K, value: EditableTemplateBlock[K]) {
    onChange({ ...block, [field]: value })
  }

  function updateBullet(bulletId: string, updates: Partial<BulletItem>) {
    const bullets = block.bullets.map(b => b.id === bulletId ? { ...b, ...updates } : b)
    onChange({ ...block, bullets })
  }

  function addBullet() {
    const newBullet: BulletItem = { id: `b-${Date.now()}`, text: '', locked: false }
    onChange({ ...block, bullets: [...block.bullets, newBullet] })
  }

  function removeBullet(bulletId: string) {
    onChange({ ...block, bullets: block.bullets.filter(b => b.id !== bulletId) })
  }

  function moveBullet(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= block.bullets.length) return
    const bullets = [...block.bullets]
    ;[bullets[index], bullets[newIndex]] = [bullets[newIndex], bullets[index]]
    onChange({ ...block, bullets })
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', boxShadow: 'var(--card-shadow)' }}>
      {/* Header fields */}
      <div className="grid grid-cols-[1fr_80px_160px] gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
          <input
            type="text"
            value={block.title}
            onChange={e => updateField('title', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Icon</label>
          <input
            type="text"
            value={block.icon}
            onChange={e => updateField('icon', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm text-center"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Timeline</label>
          <input
            type="text"
            value={block.timelineLabel}
            onChange={e => updateField('timelineLabel', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Action Callout */}
      <div className="mb-5">
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          <span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] mr-1.5" />
          YOUR ACTION Callout
        </label>
        <VariableInput
          value={block.action}
          onChange={v => updateField('action', v)}
        />
      </div>

      {/* Bullets */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Bullet Points
        </label>
        <div className="flex flex-col gap-2">
          {block.bullets.map((bullet, i) => (
            <BulletRow
              key={bullet.id}
              bullet={bullet}
              index={i}
              isFirst={i === 0}
              isLast={i === block.bullets.length - 1}
              onUpdate={updates => updateBullet(bullet.id, updates)}
              onRemove={() => removeBullet(bullet.id)}
              onMove={dir => moveBullet(i, dir)}
            />
          ))}
        </div>
        <button
          onClick={addBullet}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
          style={{ color: '#2563eb', background: '#2563eb11' }}
        >
          + Add Bullet
        </button>
      </div>

      {/* Variable Reference */}
      <VariableReference />

      {/* Reset */}
      <div className="border-t pt-4 mt-4 flex justify-end" style={{ borderColor: 'var(--table-border)' }}>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ color: '#ef4444' }}
        >
          Reset This Block to Default
        </button>
      </div>
    </div>
  )
}

/* ── Bullet Row ── */
function BulletRow({ bullet, index, isFirst, isLast, onUpdate, onRemove, onMove }: {
  bullet: BulletItem
  index: number
  isFirst: boolean
  isLast: boolean
  onUpdate: (updates: Partial<BulletItem>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2"
      style={{
        background: bullet.locked ? 'var(--background)' : 'transparent',
        border: bullet.locked ? '1px dashed var(--input-border)' : '1px solid var(--table-border)',
      }}
    >
      {/* Reorder arrows */}
      <div className="flex flex-col gap-0.5 mt-1.5 flex-shrink-0">
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="text-xs leading-none cursor-pointer disabled:opacity-20"
          style={{ color: 'var(--text-secondary)' }}
        >▲</button>
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          className="text-xs leading-none cursor-pointer disabled:opacity-20"
          style={{ color: 'var(--text-secondary)' }}
        >▼</button>
      </div>

      {/* Bullet text */}
      <div className="flex-1 min-w-0">
        <textarea
          value={bullet.text}
          onChange={e => onUpdate({ text: e.target.value })}
          disabled={bullet.locked}
          rows={2}
          className="w-full rounded-lg border px-3 py-1.5 text-sm resize-none"
          style={{
            background: bullet.locked ? 'transparent' : 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: bullet.locked ? 'var(--text-secondary)' : 'var(--text-primary)',
            opacity: bullet.locked ? 0.7 : 1,
          }}
        />
        {bullet.condition && (
          <span
            className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#7c3aed22', color: '#7c3aed' }}
          >
            Conditional: shows when {bullet.condition.field} = {bullet.condition.values.join(' or ')}
            {bullet.condition.altText && ` (otherwise: "${bullet.condition.altText.substring(0, 40)}...")`}
          </span>
        )}
      </div>

      {/* Lock / Delete */}
      <div className="flex items-center gap-1 flex-shrink-0 mt-1.5">
        {bullet.locked ? (
          <span className="text-xs" title="Auto-inserted (locked)">🔒</span>
        ) : (
          <button
            onClick={onRemove}
            className="text-xs cursor-pointer px-1"
            style={{ color: '#ef4444' }}
            title="Remove bullet"
          >✕</button>
        )}
      </div>
    </div>
  )
}

/* ── Variable Input with Insert Button ── */
function VariableInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showVars, setShowVars] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function insertVariable(token: string) {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const newVal = value.substring(0, start) + token + value.substring(end)
    onChange(newVal)
    setShowVars(false)
    setTimeout(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    }, 0)
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-lg border px-3 py-2 text-sm resize-none pr-10"
        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
      />
      <button
        onClick={() => setShowVars(!showVars)}
        className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
        style={{ background: '#2563eb22', color: '#2563eb' }}
        title="Insert variable"
      >
        {'{'}x{'}'}
      </button>
      {showVars && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg border p-2 z-10 min-w-[250px]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--input-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {TEMPLATE_VARIABLES.map(v => (
            <button
              key={v.token}
              onClick={() => insertVariable(v.token)}
              className="w-full text-left px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-[#2563eb11] flex items-center justify-between gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <span>
                <code className="px-1 py-0.5 rounded text-[10px] font-bold" style={{ background: '#2563eb11', color: '#2563eb' }}>{v.token}</code>
                <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{v.label}</span>
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{v.example}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Variable Reference ── */
function VariableReference() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium cursor-pointer flex items-center gap-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        Available Template Variables
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-2">
          {TEMPLATE_VARIABLES.map(v => (
            <span
              key={v.token}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px]"
              style={{ background: '#2563eb11', color: '#2563eb' }}
            >
              <code className="font-bold">{v.token}</code>
              <span style={{ color: 'var(--text-secondary)' }}>= {v.example}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
