export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          trial_started_at: string | null
          subscription_status: string | null
          subscription_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          trial_started_at?: string | null
          subscription_status?: string | null
          subscription_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          trial_started_at?: string | null
          subscription_status?: string | null
          subscription_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }

      contracts: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          status: Database['public']['Enums']['contract_status']
          original_pdf_path: string | null
          finalized_pdf_path: string | null
          document_hash: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          status?: Database['public']['Enums']['contract_status']
          original_pdf_path?: string | null
          finalized_pdf_path?: string | null
          document_hash?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: Database['public']['Enums']['contract_status']
          original_pdf_path?: string | null
          finalized_pdf_path?: string | null
          document_hash?: string | null
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contracts_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      contract_signers: {
        Row: {
          id: string
          contract_id: string
          full_name: string
          email: string | null
          phone: string | null
          signing_token: string
          status: Database['public']['Enums']['signer_status']
          signature_data: string | null
          signature_type: Database['public']['Enums']['signature_type'] | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string | null
          otp_verified_at: string | null
          document_read_at: string | null
          signed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          signing_token: string
          status?: Database['public']['Enums']['signer_status']
          signature_data?: string | null
          signature_type?: Database['public']['Enums']['signature_type'] | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          otp_verified_at?: string | null
          document_read_at?: string | null
          signed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string | null
          phone?: string | null
          status?: Database['public']['Enums']['signer_status']
          signature_data?: string | null
          signature_type?: Database['public']['Enums']['signature_type'] | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          otp_verified_at?: string | null
          document_read_at?: string | null
          signed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contract_signers_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }

      otp_codes: {
        Row: {
          id: string
          signer_id: string
          code: string
          expires_at: string
          used: boolean
          attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          signer_id: string
          code: string
          expires_at?: string
          used?: boolean
          attempts?: number
          created_at?: string
        }
        Update: {
          used?: boolean
          attempts?: number
        }
        Relationships: [
          {
            foreignKeyName: 'otp_codes_signer_id_fkey'
            columns: ['signer_id']
            isOneToOne: false
            referencedRelation: 'contract_signers'
            referencedColumns: ['id']
          },
        ]
      }

      contract_events: {
        Row: {
          id: string
          contract_id: string
          signer_id: string | null
          event_type: Database['public']['Enums']['event_type']
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          signer_id?: string | null
          event_type: Database['public']['Enums']['event_type']
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contract_events_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }

      finalized_documents: {
        Row: {
          id: string
          contract_id: string
          storage_path: string
          file_size_bytes: number | null
          sha256_hash: string
          signed_by: Json
          verification_id: string
          verification_key: string
          verification_qr_path: string | null
          is_publicly_verifiable: boolean
          document_access_mode: Database['public']['Enums']['document_access_mode']
          revoked_at: string | null
          finalized_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          storage_path: string
          file_size_bytes?: number | null
          sha256_hash: string
          signed_by: Json
          verification_id: string
          verification_key: string
          verification_qr_path?: string | null
          is_publicly_verifiable?: boolean
          document_access_mode?: Database['public']['Enums']['document_access_mode']
          revoked_at?: string | null
          finalized_at?: string
        }
        Update: {
          is_publicly_verifiable?: boolean
          document_access_mode?: Database['public']['Enums']['document_access_mode']
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'finalized_documents_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: true
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }

      payments: {
        Row: {
          id: string
          user_id: string
          amount_mzn: number
          method: string
          status: Database['public']['Enums']['payment_status']
          reference: string | null
          proof_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_mzn: number
          method: string
          status?: Database['public']['Enums']['payment_status']
          reference?: string | null
          proof_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          amount_mzn?: number
          method?: string
          status?: Database['public']['Enums']['payment_status']
          reference?: string | null
          proof_url?: string | null
          metadata?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      fn_all_signers_signed: {
        Args: { p_contract_id: string }
        Returns: boolean
      }
      fn_get_verification_data: {
        Args: { p_verification_id: string }
        Returns: {
          verification_id: string
          is_publicly_verifiable: boolean
          revoked_at: string | null
          contract_title: string
          finalized_at: string
          signer_count: number
          sha256_hash: string
          signed_by: Json
          document_access_mode: Database['public']['Enums']['document_access_mode']
        }[]
      }
    }

    Enums: {
      contract_status: 'draft' | 'pending' | 'completed' | 'expired'
      signer_status: 'pending' | 'viewed' | 'otp_verified' | 'signed'
      signature_type: 'drawn' | 'typed'
      event_type:
        | 'contract_created'
        | 'signer_invited'
        | 'signer_viewed'
        | 'otp_sent'
        | 'otp_verified'
        | 'otp_failed'
        | 'signer_signed'
        | 'contract_finalized'
        | 'link_expired'
        | 'contract_revoked'
      document_access_mode: 'key_required' | 'owner_only' | 'public'
      payment_status: 'pending' | 'approved' | 'rejected'
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type ProfileRow = Tables<'profiles'>
export type ContractRow = Tables<'contracts'>
export type ContractSignerRow = Tables<'contract_signers'>
export type OtpCodeRow = Tables<'otp_codes'>
export type ContractEventRow = Tables<'contract_events'>
export type FinalizedDocumentRow = Tables<'finalized_documents'>
export type PaymentRow = Tables<'payments'>

export type ContractStatus = Enums<'contract_status'>
export type SignerStatus = Enums<'signer_status'>
export type SignatureType = Enums<'signature_type'>
export type EventType = Enums<'event_type'>
export type DocumentAccessMode = Enums<'document_access_mode'>
export type PaymentStatus = Enums<'payment_status'>