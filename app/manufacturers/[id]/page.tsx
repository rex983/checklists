'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { TemplateEditor } from '@/components/checklist/TemplateEditor'
import { loadManufacturers } from '@/lib/checklist/manufacturerStore'
import { ManufacturerInfo } from '@/lib/checklist/types'

export default function ManufacturerTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [mfg, setMfg] = useState<ManufacturerInfo | null>(null)

  useEffect(() => {
    const found = loadManufacturers().find((m) => m.id === id) ?? null
    setMfg(found)
  }, [id])

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/manufacturers"
          className="text-sm font-medium"
          style={{ color: '#2563eb' }}
        >
          ← Back to Manufacturers
        </Link>
      </div>
      <TemplateEditor
        manufacturerId={id}
        title={mfg ? `${mfg.name} — Checklist Template` : 'Checklist Template'}
      />
    </div>
  )
}
