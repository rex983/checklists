/**
 * Data Provider — abstraction layer for checklist data sources.
 *
 * Currently uses localStorage (prototype mode).
 * When integrating into Order Process, swap implementations to use Supabase.
 *
 * Integration steps:
 * 1. Replace loadManufacturers/saveManufacturers with Supabase queries
 *    against the manufacturer_config table.
 * 2. Replace loadTemplateBlocks/saveTemplateBlocks with Supabase queries
 *    against a new checklist_templates table.
 * 3. Replace getOrders with real order data from the orders table,
 *    mapping the orders table schema to ChecklistInput.
 */

import { ManufacturerInfo, ChecklistInput } from './types'
import { EditableTemplateBlock } from './templateTypes'
import { loadManufacturers, saveManufacturers } from './manufacturerStore'
import { loadTemplateBlocks, saveTemplateBlocks } from './templateStore'
import { getDefaultOrders } from './mockData'

export interface ChecklistDataProvider {
  // Manufacturers
  getManufacturers(): ManufacturerInfo[]
  setManufacturers(mfgs: ManufacturerInfo[]): void

  // Template blocks
  getTemplateBlocks(): EditableTemplateBlock[]
  setTemplateBlocks(blocks: EditableTemplateBlock[]): void

  // Orders (read-only in checklist context)
  getOrders(): ChecklistInput[]
}

/** localStorage-based provider for the standalone prototype */
export function createLocalProvider(): ChecklistDataProvider {
  return {
    getManufacturers: loadManufacturers,
    setManufacturers: saveManufacturers,
    getTemplateBlocks: loadTemplateBlocks,
    setTemplateBlocks: saveTemplateBlocks,
    getOrders: () => getDefaultOrders(loadManufacturers()),
  }
}

/**
 * Supabase-based provider stub for Order Process integration.
 * Uncomment and implement when ready to connect to real data.
 *
 * export function createSupabaseProvider(supabase: SupabaseClient): ChecklistDataProvider {
 *   return {
 *     getManufacturers: async () => {
 *       const { data } = await supabase.from('manufacturer_config').select('*')
 *       return (data ?? []).map(row => ({
 *         id: row.id,
 *         name: row.name,
 *         phone: row.phone,
 *         email: row.email,
 *         contactName: row.contact_name,
 *         logoUrl: row.logo_url,
 *       }))
 *     },
 *     // ... etc
 *   }
 * }
 */
