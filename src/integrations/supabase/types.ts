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
      clients: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          cnpj: string
          company_name: string
          created_at: string | null
          id: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          company_name: string
          created_at?: string | null
          id?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          company_name?: string
          created_at?: string | null
          id?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kanban_cards: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          labels: string[] | null
          priority: string | null
          project_id: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          priority?: string | null
          project_id?: string | null
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          priority?: string | null
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean | null
          created_at: string | null
          customer_id: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_leader: boolean | null
          project_id: string | null
          role: string
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_leader?: boolean | null
          project_id?: string | null
          role: string
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_leader?: boolean | null
          project_id?: string | null
          role?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_time_entries: {
        Row: {
          created_at: string | null
          hours: unknown
          id: string
          project_id: string
          time_entry_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hours: unknown
          id?: string
          project_id: string
          time_entry_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hours?: unknown
          id?: string
          project_id?: string
          time_entry_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_time_entries_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          court: string | null
          created_at: string | null
          end_date: string | null
          id: string
          search_text: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          court?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          search_text: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          court?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          search_text?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_parameters: {
        Row: {
          created_at: string | null
          id: string
          notification_email: string
          search_frequency: string
          search_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_email: string
          search_frequency: string
          search_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_email?: string
          search_frequency?: string
          search_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_users: {
        Row: {
          additional_notes: string | null
          address: Json | null
          birth_date: string | null
          contract_type: string | null
          cpf: string | null
          created_at: string | null
          department: string | null
          email: string
          hire_date: string
          id: string
          manager_id: string | null
          name: string
          phone: string | null
          position: string | null
          role: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          termination_date: string | null
          updated_at: string | null
          user_id: string | null
          work_end_time: string | null
          work_schedule: Json | null
          work_start_time: string | null
        }
        Insert: {
          additional_notes?: string | null
          address?: Json | null
          birth_date?: string | null
          contract_type?: string | null
          cpf?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          hire_date: string
          id?: string
          manager_id?: string | null
          name: string
          phone?: string | null
          position?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_end_time?: string | null
          work_schedule?: Json | null
          work_start_time?: string | null
        }
        Update: {
          additional_notes?: string | null
          address?: Json | null
          birth_date?: string | null
          contract_type?: string | null
          cpf?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_end_time?: string | null
          work_schedule?: Json | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_users_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string | null
          entrada1: string | null
          entrada2: string | null
          entrada3: string | null
          entry_date: string
          id: string
          saida1: string | null
          saida2: string | null
          saida3: string | null
          total_hours: unknown | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entrada1?: string | null
          entrada2?: string | null
          entrada3?: string | null
          entry_date: string
          id?: string
          saida1?: string | null
          saida2?: string | null
          saida3?: string | null
          total_hours?: unknown | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entrada1?: string | null
          entrada2?: string | null
          entrada3?: string | null
          entry_date?: string
          id?: string
          saida1?: string | null
          saida2?: string | null
          saida3?: string | null
          total_hours?: unknown | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vacation_periods: {
        Row: {
          contract_type: string | null
          created_at: string | null
          days_available: number
          end_date: string
          id: string
          limit_date: string | null
          payment_date: string | null
          sold_days: number | null
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          days_available?: number
          end_date: string
          id?: string
          limit_date?: string | null
          payment_date?: string | null
          sold_days?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          days_available?: number
          end_date?: string
          id?: string
          limit_date?: string | null
          payment_date?: string | null
          sold_days?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_periods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_requests: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          comments: string | null
          created_at: string | null
          days_taken: number
          end_date: string
          id: string
          payment_date: string | null
          sold_days: number | null
          start_date: string
          status: Database["public"]["Enums"]["vacation_status"]
          updated_at: string | null
          user_id: string
          vacation_period_id: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          days_taken: number
          end_date: string
          id?: string
          payment_date?: string | null
          sold_days?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["vacation_status"]
          updated_at?: string | null
          user_id: string
          vacation_period_id: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          days_taken?: number
          end_date?: string
          id?: string
          payment_date?: string | null
          sold_days?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["vacation_status"]
          updated_at?: string | null
          user_id?: string
          vacation_period_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_requests_vacation_period_id_fkey"
            columns: ["vacation_period_id"]
            isOneToOne: false
            referencedRelation: "vacation_periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_vacation_days: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: number
      }
      get_user_monthly_hours: {
        Args: {
          user_id: string
          year_month: string
        }
        Returns: {
          day: number
          total_hours: unknown
          project_hours: unknown
        }[]
      }
      has_permission: {
        Args: {
          permission_code: string
        }
        Returns: boolean
      }
    }
    Enums: {
      subscription_status: "active" | "inactive" | "pending" | "cancelled"
      user_role: "admin" | "user"
      user_status: "active" | "inactive"
      vacation_status: "pending" | "approved" | "denied" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
