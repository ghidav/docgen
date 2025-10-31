"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, RefreshCw, Save, Loader2, Download } from "lucide-react"

interface TopBarProps {
  view: "list" | "editor"
  // Editor-specific props
  onBack?: () => void
  onSettings?: () => void
  onRefetch?: () => void
  onExport?: () => void
  onSave?: () => void
  saving?: boolean
  refetching?: boolean
  exporting?: boolean
  hasDocumentId?: boolean
}

export function TopBar({
  view,
  onBack,
  onSettings,
  onRefetch,
  onExport,
  onSave,
  saving = false,
  refetching = false,
  exporting = false,
  hasDocumentId = false,
}: TopBarProps) {
  return (
    <div className="fixed top-0 left-16 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="px-8 h-14 flex items-center justify-between">
        {view === "editor" ? (
          <>
            <div className="flex items-center gap-3">
              {onBack && (
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onSettings && (
                <Button onClick={onSettings} variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {hasDocumentId && onRefetch && (
                <Button
                  onClick={onRefetch}
                  disabled={refetching}
                  variant="outline"
                  size="sm"
                >
                  {refetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
              {hasDocumentId && onExport && (
                <Button
                  onClick={onExport}
                  disabled={exporting}
                  variant="outline"
                  size="sm"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}
              {onSave && (
                <Button onClick={onSave} disabled={saving} size="sm">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </>
        ) : (
          // Minimal/empty for list view
          <div className="w-full" />
        )}
      </div>
    </div>
  )
}
