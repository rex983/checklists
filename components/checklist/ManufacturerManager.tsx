'use client'

import { useState, useEffect, useRef } from 'react'
import { ManufacturerInfo } from '@/lib/checklist/types'
import { loadManufacturers, saveManufacturers } from '@/lib/checklist/manufacturerStore'
import { defaultManufacturers } from '@/lib/checklist/mockData'
import { useToast } from '@/components/checklist/Toast'
/* eslint-disable @next/next/no-img-element */

export function ManufacturerManager() {
  const [manufacturers, setManufacturers] = useState<ManufacturerInfo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<ManufacturerInfo>>({})
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setManufacturers(loadManufacturers())
  }, [])

  function save(updated: ManufacturerInfo[]) {
    setManufacturers(updated)
    saveManufacturers(updated)
  }

  function startEdit(mfg: ManufacturerInfo) {
    setEditingId(mfg.id)
    setDraft({ ...mfg })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft({})
  }

  function saveEdit() {
    if (!editingId) return
    const updated = manufacturers.map((m) =>
      m.id === editingId ? { ...m, ...draft } as ManufacturerInfo : m
    )
    save(updated)
    setEditingId(null)
    setDraft({})
    showToast('Manufacturer updated', 'success')
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, mfgId: string) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (editingId === mfgId) {
        setDraft((prev) => ({ ...prev, logoUrl: dataUrl }))
      } else {
        const updated = manufacturers.map((m) =>
          m.id === mfgId ? { ...m, logoUrl: dataUrl } : m
        )
        save(updated)
        showToast('Logo updated', 'success')
      }
    }
    reader.readAsDataURL(file)
  }

  function resetToDefaults() {
    save(defaultManufacturers)
    setEditingId(null)
    setDraft({})
    showToast('Reset to default manufacturers', 'info')
  }

  function addManufacturer() {
    const id = `mfg-${Date.now()}`
    const newMfg: ManufacturerInfo = {
      id,
      name: 'New Manufacturer',
      phone: '',
      email: '',
      contactName: '',
      logoUrl: '',
    }
    save([...manufacturers, newMfg])
    startEdit(newMfg)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Manufacturer Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={addManufacturer}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)' }}
          >
            + Add Manufacturer
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer"
            style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}
          >
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {manufacturers.map((mfg) => {
          const isEditing = editingId === mfg.id

          return (
            <div
              key={mfg.id}
              className="rounded-xl p-5"
              style={{
                background: 'var(--bg-card)',
                boxShadow: 'var(--card-shadow)',
                borderLeft: isEditing ? '4px solid #2563eb' : '4px solid transparent',
              }}
            >
              <div className="flex gap-5 items-start">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer relative group"
                    style={{ borderColor: 'var(--input-border)', background: 'var(--background)' }}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.dataset.mfgId = mfg.id
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    {(isEditing ? draft.logoUrl : mfg.logoUrl) ? (
                      <>
                        <img
                          src={(isEditing ? draft.logoUrl : mfg.logoUrl) || ''}
                          alt={mfg.name}
                          className="object-contain w-full h-full p-1"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl block mb-1">📷</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      <EditField
                        label="Name"
                        value={draft.name ?? ''}
                        onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                      />
                      <EditField
                        label="Contact Name"
                        value={draft.contactName ?? ''}
                        onChange={(v) => setDraft((p) => ({ ...p, contactName: v }))}
                      />
                      <EditField
                        label="Phone"
                        value={draft.phone ?? ''}
                        onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
                      />
                      <EditField
                        label="Email"
                        value={draft.email ?? ''}
                        onChange={(v) => setDraft((p) => ({ ...p, email: v }))}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {mfg.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div><span className="font-medium">Contact:</span> {mfg.contactName || '—'}</div>
                        <div><span className="font-medium">Phone:</span> {mfg.phone || '—'}</div>
                        <div><span className="font-medium">Email:</span> {mfg.email || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
                        style={{ background: '#059669' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer"
                        style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(mfg)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ color: '#2563eb' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const updated = manufacturers.filter((m) => m.id !== mfg.id)
                          save(updated)
                          showToast(`Removed ${mfg.name}`, 'info')
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ color: '#ef4444' }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hidden file input for logo uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const mfgId = e.target.dataset.mfgId
          if (mfgId) handleLogoUpload(e, mfgId)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  )
}
