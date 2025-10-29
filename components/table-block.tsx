"use client"

import { useState } from "react"
import { Block } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Markdown } from "@/components/ui/markdown"
import { Pencil, Plus, Trash2, Table as TableIcon } from "lucide-react"
import {
  parseMarkdownTable,
  serializeToMarkdown,
  addRow,
  addColumn,
  deleteRow,
  deleteColumn,
  updateCell,
  updateHeader,
  type TableData
} from "@/lib/table-utils"

interface TableBlockProps {
  block: Block
  onUpdate: (block: Block) => void
}

export function TableBlock({ block, onUpdate }: TableBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tableData, setTableData] = useState<TableData>(() =>
    parseMarkdownTable(block.content)
  )

  const handleSave = () => {
    const markdown = serializeToMarkdown(tableData)
    onUpdate({ ...block, content: markdown })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTableData(parseMarkdownTable(block.content))
    setIsEditing(false)
  }

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setTableData(updateCell(tableData, rowIndex, colIndex, value))
  }

  const handleHeaderChange = (colIndex: number, value: string) => {
    setTableData(updateHeader(tableData, colIndex, value))
  }

  const handleAddRow = () => {
    setTableData(addRow(tableData))
  }

  const handleDeleteRow = (rowIndex: number) => {
    setTableData(deleteRow(tableData, rowIndex))
  }

  const handleAddColumn = () => {
    setTableData(addColumn(tableData))
  }

  const handleDeleteColumn = (colIndex: number) => {
    setTableData(deleteColumn(tableData, colIndex))
  }

  if (isEditing) {
    return (
      <div className="space-y-3 border rounded-md p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TableIcon className="h-4 w-4" />
            <span>Edit Table</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Column
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Row
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-8"></th>
                {tableData.headers.map((header, colIndex) => (
                  <th key={colIndex} className="relative border p-0">
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                      className="border-0 font-semibold text-center rounded-none h-9"
                      placeholder={`Header ${colIndex + 1}`}
                    />
                    {tableData.headers.length > 1 && (
                      <button
                        onClick={() => handleDeleteColumn(colIndex)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity shadow-sm"
                        title="Delete column"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="w-8 text-center">
                    {tableData.rows.length > 1 && (
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded p-1 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border p-0">
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="border-0 rounded-none h-9"
                        placeholder="Empty"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    )
  }

  // View mode
  if (!block.content || block.content.trim() === '') {
    return (
      <button
        onClick={() => {
          setTableData({ headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']] })
          setIsEditing(true)
        }}
        className="w-full border-2 border-dashed rounded-md p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2"
      >
        <TableIcon className="h-8 w-8" />
        <span className="text-sm">Click to create a table</span>
      </button>
    )
  }

  return (
    <div className="group relative">
      <div className="border rounded-md p-4 bg-muted/10">
        <Markdown>{block.content}</Markdown>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background border rounded-md p-2 shadow-sm"
        title="Edit table"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )
}
