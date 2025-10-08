import React from 'react'
import { Button } from '../ui/Button'

interface Props {
  items: any[]
  setItems: (items: any[]) => void
  columns: string[]
}

export const ClaimItemsTable: React.FC<Props> = ({ items, setItems, columns }) => {
  const addRow = () => setItems([...items, Object.fromEntries(columns.map(c => [c.toLowerCase(), '']))])

  const updateCell = (i: number, field: string, value: any) => {
    const updated = [...items]
    updated[i][field.toLowerCase()] = value
    setItems(updated)
  }

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-gray-600">
            {columns.map((col) => (
              <th key={col} className="py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              {columns.map((col) => (
                <td key={col}>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={item[col.toLowerCase()] || ''}
                    onChange={(e) => updateCell(i, col, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-3" onClick={addRow}>+ Add Row</Button>
    </div>
  )
}
