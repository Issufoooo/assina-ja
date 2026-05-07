import { createHash } from 'crypto'

export function hashDocument(buffer: Uint8Array | Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}
