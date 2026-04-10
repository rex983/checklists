import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/checklist/supabase'
import { originMatchesHost } from '@/lib/checklist/apiSecurity'

/**
 * GET /api/checklist/views?ids=cust-1,cust-2,...
 *
 * Returns view timestamps for the given customer IDs.
 * Called by the dashboard to sync "Viewed" status from the tracking pixel data.
 */
export async function GET(request: NextRequest) {
  if (!originMatchesHost(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ views: {}, configured: false })
  }

  const idsParam = request.nextUrl.searchParams.get('ids')
  if (!idsParam) {
    return NextResponse.json({ views: {} })
  }

  const ids = idsParam.split(',').slice(0, 100) // cap at 100
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ views: {} })
  }

  try {
    const { data, error } = await supabase
      .from('checklist_views')
      .select('customer_id, viewed_at')
      .in('customer_id', ids)

    if (error) throw error

    const views: Record<string, string> = {}
    for (const row of data ?? []) {
      views[row.customer_id] = row.viewed_at
    }

    return NextResponse.json({ views, configured: true })
  } catch (e) {
    console.error('Views fetch error:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ views: {}, error: 'Failed to fetch views' }, { status: 500 })
  }
}
