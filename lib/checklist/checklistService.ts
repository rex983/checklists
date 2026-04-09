import { ChecklistInput } from './types'

export async function sendChecklistEmail(input: ChecklistInput): Promise<{
  success: boolean
  sent: boolean
  templateKey?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/checklist/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    return await response.json()
  } catch (error) {
    return { success: false, sent: false, error: String(error) }
  }
}
