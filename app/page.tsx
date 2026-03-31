'use client'

import { Suspense } from 'react'
import { ChecklistDashboard } from '@/components/checklist/ChecklistDashboard'

export default function Home() {
  return (
    <Suspense>
      <ChecklistDashboard />
    </Suspense>
  )
}
