import React, { useState } from 'react'

interface Props {
  onFilesSelected: (files: File[]) => void
}

export default function FileUploader({ onFilesSelected }: Props) {
  const [selected, setSelected] = useState<File[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setSelected(files)
    onFilesSelected(files)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Attachments</label>
      <input type="file" multiple onChange={handleChange} className="mt-1" />
      {selected.length > 0 && (
        <ul className="text-sm mt-2">
          {selected.map((f, i) => <li key={i}>{f.name}</li>)}
        </ul>
      )}
    </div>
  )
}
