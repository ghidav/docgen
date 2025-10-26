"use client"

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react"

type CurrentDocumentContextValue = {
  currentDocumentId?: string
  setCurrentDocumentId: (id?: string) => void
  reloadTrigger: number
  triggerReload: () => void
}

const CurrentDocumentContext = createContext<CurrentDocumentContextValue | undefined>(undefined)

export function CurrentDocumentProvider({ children }: { children: ReactNode }) {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>(undefined)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const triggerReload = useCallback(() => {
    setReloadTrigger(prev => prev + 1)
  }, [])

  const value = useMemo(
    () => ({
      currentDocumentId,
      setCurrentDocumentId,
      reloadTrigger,
      triggerReload,
    }),
    [currentDocumentId, reloadTrigger, triggerReload],
  )

  return <CurrentDocumentContext.Provider value={value}>{children}</CurrentDocumentContext.Provider>
}

export function useCurrentDocument() {
  const context = useContext(CurrentDocumentContext)
  if (!context) {
    throw new Error("useCurrentDocument must be used within a CurrentDocumentProvider")
  }
  return context
}
