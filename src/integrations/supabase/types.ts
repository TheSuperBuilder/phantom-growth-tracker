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
      current_value_companies: {
        Row: {
          company_name: string
          created_at: string
          current_value: number | null
          id: string
          industry: string | null
          last_updated: string
          notes: string | null
          person_name: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          current_value?: number | null
          id?: string
          industry?: string | null
          last_updated?: string
          notes?: string | null
          person_name?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          current_value?: number | null
          id?: string
          industry?: string | null
          last_updated?: string
          notes?: string | null
          person_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      past_value_companies: {
        Row: {
          company_name: string
          created_at: string
          decision_date: string | null
          id: string
          industry: string | null
          notes: string | null
          past_value: number | null
          person_name: string | null
          reason_not_investing: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          decision_date?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          past_value?: number | null
          person_name?: string | null
          reason_not_investing?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          decision_date?: string | null
          id?: string
          industry?: string | null
          notes?: string | null
          past_value?: number | null
          person_name?: string | null
          reason_not_investing?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_companies: {
        Row: {
          company_name: string
          created_at: string
          current_value: number | null
          employee_id: string | null
          id: string
          industry: string | null
          investment_date: string | null
          investment_value: number | null
          notes: string | null
          reason_for_investment: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          current_value?: number | null
          employee_id?: string | null
          id?: string
          industry?: string | null
          investment_date?: string | null
          investment_value?: number | null
          notes?: string | null
          reason_for_investment?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          current_value?: number | null
          employee_id?: string | null
          id?: string
          industry?: string | null
          investment_date?: string | null
          investment_value?: number | null
          notes?: string | null
          reason_for_investment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_companies_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      anti_portfolio_view: {
        Row: {
          company_name: string | null
          current_value: number | null
          current_value_updated: string | null
          decision_date: string | null
          growth_percentage: number | null
          industry: string | null
          notes: string | null
          past_entry_created: string | null
          past_value: number | null
          person_name: string | null
          reason_not_investing: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_all_rejected_companies: {
        Args: { search_term?: string; page_size?: number; page_offset?: number }
        Returns: {
          company_name: string
          industry: string
          decision_date: string
          reason_not_investing: string
          notes: string
          past_value: number
          current_value: number
          growth_percentage: number
          past_entry_created: string
          current_value_updated: string
          person_name: string
          total_count: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_user_approved: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
