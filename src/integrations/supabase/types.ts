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
      chambres: {
        Row: {
          caution: number | null
          created_at: string
          description: string | null
          est_disponible: boolean
          id: string
          images: string[] | null
          logement_id: string
          marge: number | null
          nom: string
          nombre_personnes: number
          prix_bailleur: number
          prix_zeyna: number | null
          updated_at: string
        }
        Insert: {
          caution?: number | null
          created_at?: string
          description?: string | null
          est_disponible?: boolean
          id?: string
          images?: string[] | null
          logement_id: string
          marge?: number | null
          nom: string
          nombre_personnes?: number
          prix_bailleur: number
          prix_zeyna?: number | null
          updated_at?: string
        }
        Update: {
          caution?: number | null
          created_at?: string
          description?: string | null
          est_disponible?: boolean
          id?: string
          images?: string[] | null
          logement_id?: string
          marge?: number | null
          nom?: string
          nombre_personnes?: number
          prix_bailleur?: number
          prix_zeyna?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chambres_logement_id_fkey"
            columns: ["logement_id"]
            isOneToOne: false
            referencedRelation: "logements"
            referencedColumns: ["id"]
          },
        ]
      }
      contrats: {
        Row: {
          contenu: Json | null
          created_at: string
          etudiant_id: string
          id: string
          reservation_id: string
          url_pdf: string | null
        }
        Insert: {
          contenu?: Json | null
          created_at?: string
          etudiant_id: string
          id?: string
          reservation_id: string
          url_pdf?: string | null
        }
        Update: {
          contenu?: Json | null
          created_at?: string
          etudiant_id?: string
          id?: string
          reservation_id?: string
          url_pdf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrats_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          created_at: string
          est_visible: boolean
          id: string
          ordre: number
          question: string
          reponse: string
        }
        Insert: {
          created_at?: string
          est_visible?: boolean
          id?: string
          ordre?: number
          question: string
          reponse: string
        }
        Update: {
          created_at?: string
          est_visible?: boolean
          id?: string
          ordre?: number
          question?: string
          reponse?: string
        }
        Relationships: []
      }
      logements: {
        Row: {
          adresse: string
          bailleur_id: string
          conditions_electricite: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          nom: string
          pays: string
          statut: Database["public"]["Enums"]["logement_statut"]
          type: string
          updated_at: string
          ville: string
        }
        Insert: {
          adresse: string
          bailleur_id: string
          conditions_electricite?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nom: string
          pays?: string
          statut?: Database["public"]["Enums"]["logement_statut"]
          type?: string
          updated_at?: string
          ville: string
        }
        Update: {
          adresse?: string
          bailleur_id?: string
          conditions_electricite?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nom?: string
          pays?: string
          statut?: Database["public"]["Enums"]["logement_statut"]
          type?: string
          updated_at?: string
          ville?: string
        }
        Relationships: []
      }
      paiements: {
        Row: {
          created_at: string
          est_confirme: boolean
          etudiant_id: string
          id: string
          methode: Database["public"]["Enums"]["paiement_methode"]
          montant: number
          reference: string | null
          reservation_id: string
        }
        Insert: {
          created_at?: string
          est_confirme?: boolean
          etudiant_id: string
          id?: string
          methode: Database["public"]["Enums"]["paiement_methode"]
          montant: number
          reference?: string | null
          reservation_id: string
        }
        Update: {
          created_at?: string
          est_confirme?: boolean
          etudiant_id?: string
          id?: string
          methode?: Database["public"]["Enums"]["paiement_methode"]
          montant?: number
          reference?: string | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          prenom: string
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          chambre_id: string
          created_at: string
          date_debut: string
          date_fin: string | null
          etudiant_id: string
          id: string
          logement_id: string
          montant_total: number
          statut: Database["public"]["Enums"]["reservation_statut"]
          updated_at: string
        }
        Insert: {
          chambre_id: string
          created_at?: string
          date_debut: string
          date_fin?: string | null
          etudiant_id: string
          id?: string
          logement_id: string
          montant_total: number
          statut?: Database["public"]["Enums"]["reservation_statut"]
          updated_at?: string
        }
        Update: {
          chambre_id?: string
          created_at?: string
          date_debut?: string
          date_fin?: string | null
          etudiant_id?: string
          id?: string
          logement_id?: string
          montant_total?: number
          statut?: Database["public"]["Enums"]["reservation_statut"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_chambre_id_fkey"
            columns: ["chambre_id"]
            isOneToOne: false
            referencedRelation: "chambres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_logement_id_fkey"
            columns: ["logement_id"]
            isOneToOne: false
            referencedRelation: "logements"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_site: {
        Row: {
          cle: string
          id: string
          label: string
          ordre: number
          updated_at: string
          valeur: string
        }
        Insert: {
          cle: string
          id?: string
          label: string
          ordre?: number
          updated_at?: string
          valeur: string
        }
        Update: {
          cle?: string
          id?: string
          label?: string
          ordre?: number
          updated_at?: string
          valeur?: string
        }
        Relationships: []
      }
      temoignages: {
        Row: {
          contenu: string
          created_at: string
          est_visible: boolean
          id: string
          nom: string
          note: number
          role: string
        }
        Insert: {
          contenu: string
          created_at?: string
          est_visible?: boolean
          id?: string
          nom: string
          note?: number
          role: string
        }
        Update: {
          contenu?: string
          created_at?: string
          est_visible?: boolean
          id?: string
          nom?: string
          note?: number
          role?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_validated: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_validated?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_validated?: boolean
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
      is_validated_bailleur: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "bailleur" | "etudiant"
      logement_statut: "en_attente" | "valide" | "rejete"
      paiement_methode:
        | "orange_money"
        | "mtn_money"
        | "moov_money"
        | "carte_bancaire"
      reservation_statut: "en_attente" | "confirmee" | "annulee"
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
      app_role: ["admin", "bailleur", "etudiant"],
      logement_statut: ["en_attente", "valide", "rejete"],
      paiement_methode: [
        "orange_money",
        "mtn_money",
        "moov_money",
        "carte_bancaire",
      ],
      reservation_statut: ["en_attente", "confirmee", "annulee"],
    },
  },
} as const
