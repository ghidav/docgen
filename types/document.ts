export interface Block {
  id: string
  type: "text" | "image" | "table" | "list"
  content: string
  created_at?: string
  updated_at?: string
}

export interface Subsection {
  id: string
  title: string
  blocks: Block[]
  created_at?: string
  updated_at?: string
}

export interface Section {
  id: string
  title: string
  subsections: Subsection[]
  blocks: Block[]
  created_at?: string
  updated_at?: string
}

export interface Document {
  id: string
  title: string
  subtitle?: string
  sections: Section[]
  // Metadata fields
  client?: string
  authors?: string[]
  classified?: boolean
  last_revision?: string
  contacts?: string
  created_at?: string
  updated_at?: string
}
