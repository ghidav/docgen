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

export interface Collaborator {
  id: string
  user_id: string
  role: string
  added_by?: string
  added_at?: string
  profile: {
    email: string
    full_name: string
    avatar_url?: string
  }
}

export interface Document {
  id: string
  title: string
  subtitle?: string
  sections: Section[]
  // Metadata fields
  client?: string
  authors?: string[] // Legacy field - use collaborators instead
  collaborators?: Collaborator[]
  classified?: boolean
  last_revision?: string
  contacts?: string
  created_at?: string
  updated_at?: string
}
