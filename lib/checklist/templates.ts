import { FoundationType, PermitStatus, DrawingType } from './types'

export function getTemplateKey(
  foundationType: FoundationType,
  permitStatus: PermitStatus,
  drawingType?: DrawingType
): string {
  if (permitStatus === 'No Permit') {
    return `${foundationType}|No Permit`
  }
  return `${foundationType}|Pulling a Permit|${drawingType || 'Generic'}`
}
