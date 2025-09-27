export type OverdueRule = {
  currentStatuses: string[]
  dueDateField: string
  fallbackDateCheck?: () => boolean
  targetStatus: string
  notify?: {
    to: string[]
    cc?: string[]
  }
}