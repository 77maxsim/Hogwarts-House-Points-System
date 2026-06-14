// TypeScript types matching the Hogwarts House Points DB schema

export type HouseSlug = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'
export type WinnerStatus = 'prepared_to_win' | 'final_winner' | 'tie'
export type TransactionType = 'award' | 'deduction' | 'correction'
export type AppealStatus = 'pending' | 'approved' | 'rejected'
export type FlagSeverity = 'low' | 'medium' | 'high'
export type FlagStatus = 'open' | 'reviewed' | 'dismissed'

// View: public_house_standings
export interface HouseStanding {
  house_id: string
  house_name: string
  house_slug: HouseSlug
  house_color?: string
  total_points: number
  rank?: number
}

// View: current_winner_banner (actual DB shape)
export interface WinnerBanner {
  school_year_id: string
  winner_status: WinnerStatus
  banner_text?: string | null
  leading_house_id?: string | null
  leading_house_name: string | null
  // These may or may not exist depending on view definition
  leading_house_slug?: HouseSlug | null
  leading_house_color?: string | null
  point_lead?: number | null
}

// View: recent_public_movements (actual DB shape)
export interface PublicMovement {
  id: string
  school_year_id?: string
  house_id?: string
  house_name: string
  house_slug: HouseSlug
  points: number
  transaction_type: TransactionType
  reason?: string | null
  effective_at: string
  submitted_at?: string
}

// View: role_limits_view (actual DB columns)
export interface RoleLimit {
  id: string
  name: string
  display_name: string
  point_limit: number | null
  limit_label: string
  can_submit_points: boolean
  can_submit_corrections: boolean
  can_review_appeals: boolean
}

// Table: point_transactions (actual DB columns)
export interface PointTransaction {
  id: string
  school_year_id: string
  transaction_type: TransactionType
  house_id: string
  student_id: string | null
  points: number
  reason: string
  submitted_by: string
  submitted_role_id: string
  submitted_at: string
  effective_at: string
  source: string
  original_transaction_id: string | null
  metadata: Record<string, unknown> | null
}

// Table: appeals
export interface Appeal {
  id: string
  transaction_id: string
  student_id: string
  reason: string
  status: AppealStatus
  reviewed_by: string | null
  reviewer_note: string | null
  created_at: string
  updated_at: string
}

// Table: anti_abuse_flags (actual DB columns)
export interface AntiAbuseFlag {
  id: string
  flagged_user_id: string
  house_id: string | null
  student_id: string | null
  reason: string
  severity: FlagSeverity
  status: FlagStatus
  detected_at: string
  resolved_at: string | null
  resolved_by: string | null
  reviewer_note: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// Table: users
export interface User {
  id: string
  full_name: string
  email: string
  house_id: string | null
  created_at: string
}

// Table: roles
export interface Role {
  id: string
  name: string
  point_limit: number | null
}

// Table: user_roles (actual DB columns)
export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by: string | null
  reason: string | null
  removed_at: string | null
  created_at: string
  updated_at: string
}

// Table: houses (actual DB columns)
export interface House {
  id: string
  name: string
  slug: HouseSlug
  crest: string
  primary_color: string
  secondary_color: string
  display_order: number
}

// Audit log join shape (for display)
export interface AuditRow extends PointTransaction {
  house_name?: string
  house_slug?: HouseSlug
  submitted_by_name?: string
  student_name?: string
  house_color?: string
}

// Appeals with joined data
export interface AppealWithDetail extends Appeal {
  student_name?: string
  transaction?: Partial<AuditRow>
  reviewed_by_name?: string
}

// Database type for supabase client
export interface Database {
  public: {
    Tables: {
      point_transactions: { Row: PointTransaction; Insert: Omit<PointTransaction, 'id' | 'created_at'>; Update: Partial<PointTransaction> }
      appeals: { Row: Appeal; Insert: Omit<Appeal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Appeal> }
      anti_abuse_flags: { Row: AntiAbuseFlag; Insert: Omit<AntiAbuseFlag, 'id' | 'created_at' | 'updated_at'>; Update: Partial<AntiAbuseFlag> }
      users: { Row: User; Insert: Omit<User, 'id' | 'created_at'>; Update: Partial<User> }
      roles: { Row: Role; Insert: Omit<Role, 'id'>; Update: Partial<Role> }
      user_roles: { Row: UserRole; Insert: Omit<UserRole, 'id' | 'created_at' | 'updated_at'>; Update: Partial<UserRole> }
      houses: { Row: House; Insert: Omit<House, 'id'>; Update: Partial<House> }
      anti_abuse_flag_transactions: { Row: { flag_id: string; transaction_id: string }; Insert: { flag_id: string; transaction_id: string }; Update: never }
      audit_events: { Row: { id: string; event_type: string; actor_id: string; target_id: string; metadata: Record<string, unknown>; created_at: string }; Insert: never; Update: never }
    }
    Views: {
      public_house_standings: { Row: HouseStanding }
      current_winner_banner: { Row: WinnerBanner }
      recent_public_movements: { Row: PublicMovement }
      role_limits_view: { Row: RoleLimit }
    }
    Functions: {
      create_student_appeal: { Args: { transaction_id: string; student_id: string; reason: string }; Returns: string }
      approve_appeal_and_create_correction: { Args: { appeal_id: string; reviewed_by: string; reviewer_note: string }; Returns: string }
      reject_appeal: { Args: { appeal_id: string; reviewed_by: string; reviewer_note: string }; Returns: string }
    }
  }
}
