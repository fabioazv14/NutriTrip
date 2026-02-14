import { randomUUID } from 'crypto'

export function generateSessionId() {
  return randomUUID()
}
