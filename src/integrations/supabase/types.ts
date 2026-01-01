export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          tenant_id: string
          threshold: number
          triggered_count: number
          webhook_type: Database["public"]["Enums"]["webhook_type"]
          webhook_url: string
        }
        Insert: {
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          tenant_id: string
          threshold?: number
          triggered_count?: number
          webhook_type: Database["public"]["Enums"]["webhook_type"]
          webhook_url: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          tenant_id?: string
          threshold?: number
          triggered_count?: number
          webhook_type?: Database["public"]["Enums"]["webhook_type"]
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          grace_period_until: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          tenant_id: string
          token_hash: string
          token_preview: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          grace_period_until?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          tenant_id: string
          token_hash: string
          token_preview: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          grace_period_until?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          tenant_id?: string
          token_hash?: string
          token_preview?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          asn: string | null
          body: string | null
          country: string | null
          created_at: string
          headers: Json | null
          id: string
          method: string
          notes: string | null
          org: string | null
          path: string
          payload_size: number | null
          risk_score: number
          service: string
          source_ip: string
          tags: Database["public"]["Enums"]["event_tag"][] | null
          tenant_id: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          asn?: string | null
          body?: string | null
          country?: string | null
          created_at?: string
          headers?: Json | null
          id?: string
          method: string
          notes?: string | null
          org?: string | null
          path: string
          payload_size?: number | null
          risk_score?: number
          service?: string
          source_ip: string
          tags?: Database["public"]["Enums"]["event_tag"][] | null
          tenant_id: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          asn?: string | null
          body?: string | null
          country?: string | null
          created_at?: string
          headers?: Json | null
          id?: string
          method?: string
          notes?: string | null
          org?: string | null
          path?: string
          payload_size?: number | null
          risk_score?: number
          service?: string
          source_ip?: string
          tags?: Database["public"]["Enums"]["event_tag"][] | null
          tenant_id?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_2fa_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_2fa_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_2fa_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_views: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          tenant_id: string | null
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          tenant_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          retention_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          retention_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_condition:
        | "requests_per_minute"
        | "brute_force_attempts"
        | "critical_events"
        | "sensitive_paths"
      app_role: "admin" | "viewer"
      audit_action:
        | "LOGIN_SUCCESS"
        | "LOGIN_FAILED"
        | "LOGOUT"
        | "TOKEN_CREATED"
        | "TOKEN_REVOKED"
        | "TOKEN_ROTATED"
        | "EXPORT_DATA"
        | "SETTING_CHANGED"
        | "USER_CREATED"
        | "TENANT_CREATED"
        | "TENANT_DELETED"
      event_tag: "scanner" | "bruteforce" | "false_positive" | "watchlist"
      webhook_type: "discord" | "telegram" | "slack" | "email"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_condition: [
        "requests_per_minute",
        "brute_force_attempts",
        "critical_events",
        "sensitive_paths",
      ],
      app_role: ["admin", "viewer"],
      audit_action: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "TOKEN_CREATED",
        "TOKEN_REVOKED",
        "TOKEN_ROTATED",
        "EXPORT_DATA",
        "SETTING_CHANGED",
        "USER_CREATED",
        "TENANT_CREATED",
        "TENANT_DELETED",
      ],
      event_tag: ["scanner", "bruteforce", "false_positive", "watchlist"],
      webhook_type: ["discord", "telegram", "slack", "email"],
    },
  },
} as const
