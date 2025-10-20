import { ClaimItem } from '../types'


export function sumItems(items: ClaimItem[]) { return items.reduce((s, i) => s + (i.amount || 0), 0) }
