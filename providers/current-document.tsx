"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type CurrentDocumentContextValue = {
  currentDocumentId?: string
  setCurrentDocumentId: (id?: string) => void
}

const CurrentDocumentContext = createContext<CurrentDocumentContextValue | undefined>(undefined)

export function CurrentDocumentProvider({ children }: { children: ReactNode }) {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>(undefined)

  const value = useMemo(
    () => ({
      currentDocumentId,
      setCurrentDocumentId,
    }),
    [currentDocumentId],
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
