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
      flags: {
        Row: {
          id: string
          machine_id: string
          name: string
          description: string | null
          flag_value: string
          flag_type: Database["public"]["Enums"]["flag_type"]
          regex_pattern: string | null
          xp_value: number
          is_final_flag: boolean
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          name: string
          description?: string | null
          flag_value: string
          flag_type?: Database["public"]["Enums"]["flag_type"]
          regex_pattern?: string | null
          xp_value?: number
          is_final_flag?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          machine_id?: string
          name?: string
          description?: string | null
          flag_value?: string
          flag_type?: Database["public"]["Enums"]["flag_type"]
          regex_pattern?: string | null
          xp_value?: number
          is_final_flag?: boolean
          created_at?: string
        }
      }
      machine_files: {
        Row: {
          id: string
          machine_id: string
          filename: string
          file_url: string
          file_size: number | null
          file_type: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          filename: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          machine_id?: string
          filename?: string
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          created_at?: string
        }
      }
      machine_instances: {
        Row: {
          id: string
          machine_id: string
          user_id: string
          instance_url: string | null
          ssh_config: Json | null
          status: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          user_id: string
          instance_url?: string | null
          ssh_config?: Json | null
          status?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          machine_id?: string
          user_id?: string
          instance_url?: string | null
          ssh_config?: Json | null
          status?: string
          expires_at?: string
          created_at?: string
        }
      }
      machines: {
        Row: {
          id: string
          name: string
          description: string
          creator_id: string
          difficulty: Database["public"]["Enums"]["machine_difficulty"]
          category: Database["public"]["Enums"]["machine_category"]
          status: Database["public"]["Enums"]["machine_status"]
          xp_reward: number
          vm_url: string | null
          docker_image: string | null
          instance_config: Json | null
          solve_count: number
          first_blood_user_id: string | null
          first_blood_at: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          creator_id: string
          difficulty: Database["public"]["Enums"]["machine_difficulty"]
          category: Database["public"]["Enums"]["machine_category"]
          status?: Database["public"]["Enums"]["machine_status"]
          xp_reward?: number
          vm_url?: string | null
          docker_image?: string | null
          instance_config?: Json | null
          solve_count?: number
          first_blood_user_id?: string | null
          first_blood_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          creator_id?: string
          difficulty?: Database["public"]["Enums"]["machine_difficulty"]
          category?: Database["public"]["Enums"]["machine_category"]
          status?: Database["public"]["Enums"]["machine_status"]
          xp_reward?: number
          vm_url?: string | null
          docker_image?: string | null
          instance_config?: Json | null
          solve_count?: number
          first_blood_user_id?: string | null
          first_blood_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          is_read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: Database["public"]["Enums"]["notification_type"]
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: Database["public"]["Enums"]["notification_type"]
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          total_xp: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          machine_id: string
          flag_id: string
          submitted_flag: string
          is_correct: boolean
          xp_awarded: number
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          machine_id: string
          flag_id: string
          submitted_flag: string
          is_correct?: boolean
          xp_awarded?: number
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          machine_id?: string
          flag_id?: string
          submitted_flag?: string
          is_correct?: boolean
          xp_awarded?: number
          submitted_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          category: Database["public"]["Enums"]["machine_category"]
          xp_earned: number
          machines_solved: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: Database["public"]["Enums"]["machine_category"]
          xp_earned?: number
          machines_solved?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: Database["public"]["Enums"]["machine_category"]
          xp_earned?: number
          machines_solved?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      flag_type: "static" | "dynamic" | "regex"
      machine_category: "web" | "pwn" | "crypto" | "reverse" | "forensics" | "misc"
      machine_difficulty: "beginner" | "easy" | "medium" | "hard" | "expert"
      machine_status: "draft" | "pending" | "approved" | "rejected" | "retired"
      notification_type: "info" | "success" | "warning" | "achievement"
      user_role: "user" | "creator" | "moderator" | "admin"
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
    Enums: {},
  },
} as const
