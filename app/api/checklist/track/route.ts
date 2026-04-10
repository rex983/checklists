import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/checklist/supabase'

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

/**
 * GET /api/checklist/track?cid=<customerId>
 *
 * Tracking pixel endpoint embedded in checklist emails.
 * When the email client loads this image, we record a view event.
 */
export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('cid')

  if (customerId) {
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('checklist_views').upsert(
          {
            customer_id: customerId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: 'customer_id' }
        )
      } catch (e) {
        console.error('Track pixel error:', e instanceof Error ? e.message : 'unknown')
      }
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  })
}
