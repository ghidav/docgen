export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          creator_id: string
          mongodb_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          creator_id: string
          mongodb_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          creator_id?: string
          mongodb_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      document_collaborators: {
        Row: {
          id: string
          document_id: string
          user_id: string
          role: 'viewer' | 'editor' | 'owner'
          added_by: string | null
          added_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          role?: 'viewer' | 'editor' | 'owner'
          added_by?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          role?: 'viewer' | 'editor' | 'owner'
          added_by?: string | null
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_collaborators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_collaborators_added_by_fkey"
            columns: ["added_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_document: {
        Args: {
          document_id_param: string
          user_id_param: string
        }
        Returns: boolean
      }
      get_user_document_role: {
        Args: {
          document_id_param: string
          user_id_param: string
        }
        Returns: string
      }
    }
    Enums: {
      collaborator_role: 'viewer' | 'editor' | 'owner'
    }
  }
}
