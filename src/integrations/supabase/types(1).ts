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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      conges: {
        Row: {
          commentaire: string | null
          conge_type: Database["public"]["Enums"]["conge_type"]
          created_at: string
          date_debut: string
          date_fin: string
          id: string
          justificatif_url: string | null
          priorite: Database["public"]["Enums"]["priorite_type"]
          status: Database["public"]["Enums"]["request_status"]
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaire?: string | null
          conge_type: Database["public"]["Enums"]["conge_type"]
          created_at?: string
          date_debut: string
          date_fin: string
          id?: string
          justificatif_url?: string | null
          priorite?: Database["public"]["Enums"]["priorite_type"]
          status?: Database["public"]["Enums"]["request_status"]
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaire?: string | null
          conge_type?: Database["public"]["Enums"]["conge_type"]
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          justificatif_url?: string | null
          priorite?: Database["public"]["Enums"]["priorite_type"]
          status?: Database["public"]["Enums"]["request_status"]
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entretiens: {
        Row: {
          competences_score: number | null
          created_at: string
          date_entretien: string
          evaluator_id: string
          feedback_manager: string | null
          id: string
          performance_score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competences_score?: number | null
          created_at?: string
          date_entretien: string
          evaluator_id: string
          feedback_manager?: string | null
          id?: string
          performance_score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competences_score?: number | null
          created_at?: string
          date_entretien?: string
          evaluator_id?: string
          feedback_manager?: string | null
          id?: string
          performance_score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      heures_supplementaires: {
        Row: {
          commentaire: string | null
          created_at: string
          date: string
          heures: number
          id: string
          justificatif_url: string | null
          motif: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          date: string
          heures: number
          id?: string
          justificatif_url?: string | null
          motif: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          date?: string
          heures?: number
          id?: string
          justificatif_url?: string | null
          motif?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adresse: string | null
          approved: boolean
          contact_urgence: string | null
          contact_urgence_tel: string | null
          convention_collective: string | null
          created_at: string
          date_entree: string | null
          date_naissance: string | null
          date_sortie: string | null
          departement: string | null
          email: string | null
          full_name: string
          iban: string | null
          id: string
          numero_salarie: string | null
          numero_securite_sociale: string | null
          phone: string | null
          poste: string | null
          prenom: string | null
          salaire: number | null
          statut_employe: string | null
          temps_travail: string | null
          type_contrat: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresse?: string | null
          approved?: boolean
          contact_urgence?: string | null
          contact_urgence_tel?: string | null
          convention_collective?: string | null
          created_at?: string
          date_entree?: string | null
          date_naissance?: string | null
          date_sortie?: string | null
          departement?: string | null
          email?: string | null
          full_name: string
          iban?: string | null
          id?: string
          numero_salarie?: string | null
          numero_securite_sociale?: string | null
          phone?: string | null
          poste?: string | null
          prenom?: string | null
          salaire?: number | null
          statut_employe?: string | null
          temps_travail?: string | null
          type_contrat?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresse?: string | null
          approved?: boolean
          contact_urgence?: string | null
          contact_urgence_tel?: string | null
          convention_collective?: string | null
          created_at?: string
          date_entree?: string | null
          date_naissance?: string | null
          date_sortie?: string | null
          departement?: string | null
          email?: string | null
          full_name?: string
          iban?: string | null
          id?: string
          numero_salarie?: string | null
          numero_securite_sociale?: string | null
          phone?: string | null
          poste?: string | null
          prenom?: string | null
          salaire?: number | null
          statut_employe?: string | null
          temps_travail?: string | null
          type_contrat?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      remboursements: {
        Row: {
          created_at: string
          date_depense: string
          description: string | null
          id: string
          justificatif_url: string | null
          montant: number
          motif: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_depense: string
          description?: string | null
          id?: string
          justificatif_url?: string | null
          montant: number
          motif: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_depense?: string
          description?: string | null
          id?: string
          justificatif_url?: string | null
          montant?: number
          motif?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      soldes_conges: {
        Row: {
          id: string
          restant: number | null
          total: number
          updated_at: string
          user_id: string
          utilise: number
        }
        Insert: {
          id?: string
          restant?: number | null
          total?: number
          updated_at?: string
          user_id: string
          utilise?: number
        }
        Update: {
          id?: string
          restant?: number | null
          total?: number
          updated_at?: string
          user_id?: string
          utilise?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      is_gestionnaire: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "professeur" | "admin_simple" | "admin_gestionnaire" | "employe"
      conge_type:
        | "annuel"
        | "maladie"
        | "sans_solde"
        | "exceptionnel"
        | "maternite"
      priorite_type: "normale" | "urgente"
      request_status: "en_attente" | "approuve" | "refuse"
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
      app_role: ["professeur", "admin_simple", "admin_gestionnaire", "employe"],
      conge_type: [
        "annuel",
        "maladie",
        "sans_solde",
        "exceptionnel",
        "maternite",
      ],
      priorite_type: ["normale", "urgente"],
      request_status: ["en_attente", "approuve", "refuse"],
    },
  },
} as const
