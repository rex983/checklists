'use client'

import { useState, useEffect, useMemo } from 'react'
import { Customer, ManufacturerInfo, FoundationType, PermitStatus, DrawingType, ChecklistStatus } from '@/lib/checklist/types'
import { loadCustomers, saveCustomers } from '@/lib/checklist/customerStore'
import { loadManufacturers } from '@/lib/checklist/manufacturerStore'
import { sendChecklistEmail } from '@/lib/checklist/checklistService'
import { useToast } from '@/components/checklist/Toast'

const FOUNDATION_TYPES: FoundationType[] = ['Concrete', 'Level Ground', 'Stem Wall', 'Mixed', 'Other']
const PERMIT_STATUSES: PermitStatus[] = ['No Permit', 'Pulling a Permit']
const DRAWING_TYPES: DrawingType[] = ['Generic', 'As-Built']
const STATUSES: ChecklistStatus[] = ['Not Sent', 'Sent', 'Viewed']

const STATUS_COLORS: Record<ChecklistStatus, { bg: string; text: string }> = {
  'Not Sent': { bg: '#fff3e0', text: '#e65100' },
  'Sent': { bg: '#e3f2fd', text: '#1565c0' },
  'Viewed': { bg: '#e8f5e9', text: '#2e7d32' },
}

type SortKey = 'name' | 'orderNumber' | 'createdAt' | 'checklistStatus'

export function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [manufacturers, setManufacturers] = useState<ManufacturerInfo[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Customer>>({})
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ChecklistStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<SortKey>('createdAt')
  const [showForm, setShowForm] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    setCustomers(loadCustomers())
    setManufacturers(loadManufacturers())
  }, [])

  function save(updated: Customer[]) {
    setCustomers(updated)
    saveCustomers(updated)
  }

  function addCustomer() {
    const now = new Date().toISOString()
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      orderNumber: '',
      name: '',
      email: '',
      phone: '',
      deliveryAddress: '',
      state: '',
      foundationType: 'Concrete',
      permitStatus: 'No Permit',
      manufacturerId: manufacturers[0]?.id ?? '',
      estimatedDeliveryWeeks: 8,
      checklistStatus: 'Not Sent',
      notes: '',
      createdAt: now,
    }
    setDraft(newCustomer)
    setEditingId(newCustomer.id)
    setShowForm(true)
  }

  function startEdit(c: Customer) {
    setDraft({ ...c })
    setEditingId(c.id)
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft({})
    setShowForm(false)
  }

  function saveEdit() {
    if (!editingId) return
    const existing = customers.find(c => c.id === editingId)
    const customer = { ...draft } as Customer
    customer.id = editingId

    if (!customer.name || !customer.orderNumber) {
      showToast('Name and Order Number are required', 'warning')
      return
    }

    // Set drawingType based on permit status
    if (customer.permitStatus === 'No Permit') {
      customer.drawingType = undefined
    } else if (!customer.drawingType) {
      customer.drawingType = 'Generic'
    }

    if (existing) {
      save(customers.map(c => c.id === editingId ? customer : c))
    } else {
      save([...customers, customer])
    }
    setEditingId(null)
    setDraft({})
    setShowForm(false)
    showToast(existing ? 'Customer updated' : 'Customer added', 'success')
  }

  function removeCustomer(id: string) {
    save(customers.filter(c => c.id !== id))
    showToast('Customer removed', 'info')
  }

  const mfgMap = useMemo(() => new Map(manufacturers.map(m => [m.id, m])), [manufacturers])

  function updateStatus(id: string, status: ChecklistStatus) {
    save(customers.map(c => c.id === id ? { ...c, checklistStatus: status } : c))
  }

  async function sendChecklist(c: Customer) {
    const mfg = mfgMap.get(c.manufacturerId)
    if (!mfg) {
      showToast('No manufacturer assigned', 'warning')
      return
    }
    if (!c.email) {
      showToast('Customer has no email address', 'warning')
      return
    }
    showToast(`Sending checklist to ${c.email}...`, 'info')
    const result = await sendChecklistEmail({
      orderId: c.id,
      orderNumber: c.orderNumber,
      customerName: c.name,
      customerEmail: c.email,
      deliveryAddress: c.deliveryAddress,
      state: c.state,
      foundationType: c.foundationType,
      permitStatus: c.permitStatus,
      drawingType: c.drawingType,
      manufacturer: mfg,
      estimatedDeliveryWeeks: c.estimatedDeliveryWeeks,
    })
    if (result.success) {
      updateStatus(c.id, 'Sent')
      showToast(result.sent ? `Checklist emailed to ${c.email}` : `Checklist generated (email not configured)`, result.sent ? 'success' : 'info')
    } else {
      showToast(`Failed: ${result.error}`, 'error')
    }
  }

  // Filter + sort
  const filtered = useMemo(() => {
    let list = customers
    if (filterStatus !== 'All') {
      list = list.filter(c => c.checklistStatus === filterStatus)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.orderNumber.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'createdAt') return b.createdAt.localeCompare(a.createdAt)
      return (a[sortBy] ?? '').localeCompare(b[sortBy] ?? '')
    })
  }, [customers, filterStatus, search, sortBy])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Customer Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {customers.length} customer{customers.length !== 1 ? 's' : ''} &bull;{' '}
            {customers.filter(c => c.checklistStatus === 'Not Sent').length} pending
          </p>
        </div>
        <button
          onClick={addCustomer}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#1a3a5c 0%,#2563eb 100%)' }}
        >
          + Add Customer
        </button>
      </div>

      {/* Search + Filters */}
      <div
        className="rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end"
        style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, order #, or email..."
            className="w-full rounded-lg border px-3 py-1.5 text-sm"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
          <div className="flex gap-1">
            {(['All', ...STATUSES] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                style={{
                  background: filterStatus === s ? '#2563eb' : 'transparent',
                  color: filterStatus === s ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sort</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border px-3 py-1.5 text-xs"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          >
            <option value="createdAt">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="orderNumber">Order #</option>
            <option value="checklistStatus">Status</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', borderLeft: '4px solid #2563eb' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {customers.find(c => c.id === editingId) ? 'Edit Customer' : 'New Customer'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <FormField label="Customer Name *" value={draft.name ?? ''} onChange={v => setDraft(p => ({ ...p, name: v }))} />
            <FormField label="Order Number *" value={draft.orderNumber ?? ''} onChange={v => setDraft(p => ({ ...p, orderNumber: v }))} />
            <FormField label="Email" value={draft.email ?? ''} onChange={v => setDraft(p => ({ ...p, email: v }))} type="email" />
            <FormField label="Phone" value={draft.phone ?? ''} onChange={v => setDraft(p => ({ ...p, phone: v }))} />
            <FormField label="Delivery Address" value={draft.deliveryAddress ?? ''} onChange={v => setDraft(p => ({ ...p, deliveryAddress: v }))} />
            <FormField label="State" value={draft.state ?? ''} onChange={v => setDraft(p => ({ ...p, state: v }))} />
          </div>

          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Checklist Variables
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <SelectField
              label="Foundation Type"
              value={draft.foundationType ?? 'Concrete'}
              options={FOUNDATION_TYPES}
              onChange={v => setDraft(p => ({ ...p, foundationType: v as FoundationType }))}
            />
            <SelectField
              label="Permit Status"
              value={draft.permitStatus ?? 'No Permit'}
              options={PERMIT_STATUSES}
              onChange={v => setDraft(p => ({ ...p, permitStatus: v as PermitStatus }))}
            />
            {(draft.permitStatus ?? 'No Permit') === 'Pulling a Permit' && (
              <SelectField
                label="Drawing Type"
                value={draft.drawingType ?? 'Generic'}
                options={DRAWING_TYPES}
                onChange={v => setDraft(p => ({ ...p, drawingType: v as DrawingType }))}
              />
            )}
            <SelectField
              label="Manufacturer"
              value={draft.manufacturerId ?? ''}
              options={manufacturers.map(m => m.id)}
              labels={manufacturers.map(m => m.name)}
              onChange={v => setDraft(p => ({ ...p, manufacturerId: v }))}
            />
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Est. Delivery (weeks)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={draft.estimatedDeliveryWeeks ?? 8}
                onChange={e => setDraft(p => ({ ...p, estimatedDeliveryWeeks: parseInt(e.target.value) || 8 }))}
                className="w-full rounded-lg border px-3 py-1.5 text-sm"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <textarea
              value={draft.notes ?? ''}
              onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border px-3 py-1.5 text-sm resize-none"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              placeholder="Internal notes..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border" style={{ borderColor: 'var(--input-border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button onClick={saveEdit} className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer" style={{ background: '#059669' }}>
              Save Customer
            </button>
          </div>
        </div>
      )}

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {customers.length === 0 ? 'No customers yet' : 'No matches found'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {customers.length === 0 ? 'Add your first customer to get started.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(c => {
            const mfg = mfgMap.get(c.manufacturerId)
            const statusColor = STATUS_COLORS[c.checklistStatus]
            return (
              <div
                key={c.id}
                className="rounded-xl p-4 flex items-center gap-4 group"
                style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
              >
                {/* Status badge */}
                <div className="flex-shrink-0">
                  <select
                    value={c.checklistStatus}
                    onChange={e => updateStatus(c.id, e.target.value as ChecklistStatus)}
                    className="rounded-full px-3 py-1 text-xs font-bold cursor-pointer border-0"
                    style={{ background: statusColor.bg, color: statusColor.text }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Customer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{c.name || 'Unnamed'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--background)', color: 'var(--text-secondary)' }}>
                      {c.orderNumber || 'No order #'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                </div>

                {/* Variables */}
                <div className="hidden md:flex flex-wrap gap-1.5 flex-shrink-0">
                  <VarBadge label={c.foundationType} />
                  <VarBadge label={c.permitStatus} />
                  {c.drawingType && <VarBadge label={c.drawingType} />}
                  {mfg && <VarBadge label={mfg.name} />}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => sendChecklist(c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ color: '#fff', background: '#059669' }}
                  >
                    Send
                  </button>
                  <a
                    href={`/?customer=${c.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ color: '#2563eb', background: '#2563eb11' }}
                  >
                    View
                  </a>
                  <button onClick={() => startEdit(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    Edit
                  </button>
                  <button onClick={() => removeCustomer(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer" style={{ color: '#ef4444' }}>
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
      />
    </div>
  )
}

function SelectField({ label, value, options, labels, onChange }: {
  label: string; value: string; options: string[]; labels?: string[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-1.5 text-sm"
        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>
        ))}
      </select>
    </div>
  )
}

function VarBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--background)', color: 'var(--text-secondary)' }}>
      {label}
    </span>
  )
}
