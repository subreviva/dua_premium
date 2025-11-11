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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          created_at: string
          id: string
          last_sign_in: string | null
          permissions: Json
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          last_sign_in?: string | null
          permissions?: Json
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sign_in?: string | null
          permissions?: Json
          role?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action: string
          admin_id: string | null
          bolsa_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          bolsa_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          bolsa_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_name: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_name: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_name?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_applications: {
        Row: {
          biography: string | null
          created_at: string | null
          id: string
          portfolio_url: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          biography?: string | null
          created_at?: string | null
          id?: string
          portfolio_url?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          biography?: string | null
          created_at?: string | null
          id?: string
          portfolio_url?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string | null
          genre: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          price_per_hour: number | null
          rating: number | null
          total_bookings: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          price_per_hour?: number | null
          rating?: number | null
          total_bookings?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          price_per_hour?: number | null
          rating?: number | null
          total_bookings?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bolsas_criativas: {
        Row: {
          beneficiario_id: string | null
          created_at: string | null
          current_amount: number | null
          days_left: number | null
          descricao: string | null
          donors_count: number | null
          first_donation_at: string | null
          id: string
          imagem: string | null
          is_active: boolean | null
          objetivo_dua: number
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          beneficiario_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          days_left?: number | null
          descricao?: string | null
          donors_count?: number | null
          first_donation_at?: string | null
          id?: string
          imagem?: string | null
          is_active?: boolean | null
          objetivo_dua: number
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          beneficiario_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          days_left?: number | null
          descricao?: string | null
          donors_count?: number | null
          first_donation_at?: string | null
          id?: string
          imagem?: string | null
          is_active?: boolean | null
          objetivo_dua?: number
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          artist_id: string | null
          booking_date: string
          created_at: string | null
          duration_minutes: number
          id: string
          notes: string | null
          service_id: string | null
          status: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          artist_id?: string | null
          booking_date: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          artist_id?: string | null
          booking_date?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      burns: {
        Row: {
          amount_burned: number
          artist_id: string
          bolsa_id: string
          burned_at: string | null
          burned_by: string
          id: string
          metadata: Json | null
          reason: string
          studio_payment_amount: number | null
          studio_payment_reference: string | null
        }
        Insert: {
          amount_burned: number
          artist_id: string
          bolsa_id: string
          burned_at?: string | null
          burned_by: string
          id?: string
          metadata?: Json | null
          reason: string
          studio_payment_amount?: number | null
          studio_payment_reference?: string | null
        }
        Update: {
          amount_burned?: number
          artist_id?: string
          bolsa_id?: string
          burned_at?: string | null
          burned_by?: string
          id?: string
          metadata?: Json | null
          reason?: string
          studio_payment_amount?: number | null
          studio_payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "burns_bolsa_id_fkey"
            columns: ["bolsa_id"]
            isOneToOne: false
            referencedRelation: "bolsas_criativas"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_purchases: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          from_user_id: string | null
          id: string
          payment_id: string | null
          to_user_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          payment_id?: string | null
          to_user_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          payment_id?: string | null
          to_user_id?: string
          transaction_type?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_with_user"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_with_user"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          created_at: string | null
          description: string | null
          firebase_path: string
          id: string
          likes_count: number | null
          media_url: string
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          firebase_path: string
          id?: string
          likes_count?: number | null
          media_url: string
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          firebase_path?: string
          id?: string
          likes_count?: number | null
          media_url?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creative_artists: {
        Row: {
          achievements: string[] | null
          age: number | null
          category: string | null
          created_at: string | null
          current_amount: number
          days_left: number | null
          detailed_bio: string | null
          donors_count: number
          featured: boolean | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          location: string | null
          milestones: Json | null
          name: string
          objective: string | null
          portfolio_images: string[] | null
          recent_updates: Json | null
          social_media: Json | null
          story: string | null
          tags: string[] | null
          target_amount: number
          title: string
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          achievements?: string[] | null
          age?: number | null
          category?: string | null
          created_at?: string | null
          current_amount?: number
          days_left?: number | null
          detailed_bio?: string | null
          donors_count?: number
          featured?: boolean | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          location?: string | null
          milestones?: Json | null
          name: string
          objective?: string | null
          portfolio_images?: string[] | null
          recent_updates?: Json | null
          social_media?: Json | null
          story?: string | null
          tags?: string[] | null
          target_amount?: number
          title: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          achievements?: string[] | null
          age?: number | null
          category?: string | null
          created_at?: string | null
          current_amount?: number
          days_left?: number | null
          detailed_bio?: string | null
          donors_count?: number
          featured?: boolean | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          location?: string | null
          milestones?: Json | null
          name?: string
          objective?: string | null
          portfolio_images?: string[] | null
          recent_updates?: Json | null
          social_media?: Json | null
          story?: string | null
          tags?: string[] | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      creative_scholarships: {
        Row: {
          artist_user_id: string | null
          campaign_days: number | null
          created_at: string
          current_amount: number
          description: string | null
          donors_count: number
          dua_goal: number
          id: string
          is_active: boolean
          is_completed: boolean
          project_name: string
        }
        Insert: {
          artist_user_id?: string | null
          campaign_days?: number | null
          created_at?: string
          current_amount?: number
          description?: string | null
          donors_count?: number
          dua_goal: number
          id?: string
          is_active?: boolean
          is_completed?: boolean
          project_name: string
        }
        Update: {
          artist_user_id?: string | null
          campaign_days?: number | null
          created_at?: string
          current_amount?: number
          description?: string | null
          donors_count?: number
          dua_goal?: number
          id?: string
          is_active?: boolean
          is_completed?: boolean
          project_name?: string
        }
        Relationships: []
      }
      doacoes_legacy: {
        Row: {
          bolsa_id: string | null
          created_at: string | null
          doador_id: string | null
          id: string
          mensagem: string | null
          valor_dua: number
        }
        Insert: {
          bolsa_id?: string | null
          created_at?: string | null
          doador_id?: string | null
          id?: string
          mensagem?: string | null
          valor_dua: number
        }
        Update: {
          bolsa_id?: string | null
          created_at?: string | null
          doador_id?: string | null
          id?: string
          mensagem?: string | null
          valor_dua?: number
        }
        Relationships: [
          {
            foreignKeyName: "doacoes_bolsa_id_fkey"
            columns: ["bolsa_id"]
            isOneToOne: false
            referencedRelation: "bolsas_criativas"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          artist_id: string
          created_at: string | null
          donation_type: string | null
          donor_id: string
          id: string
          message: string | null
          tx_hash: string | null
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string | null
          donation_type?: string | null
          donor_id: string
          id?: string
          message?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string | null
          donation_type?: string | null
          donor_id?: string
          id?: string
          message?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "creative_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      duacoin_accounts: {
        Row: {
          balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      duacoin_profiles: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          kyc_status: string | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          kyc_status?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          kyc_status?: string | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      duacoin_staking: {
        Row: {
          amount: number
          apy_rate: number | null
          created_at: string | null
          duration_days: number | null
          earned_rewards: number | null
          end_date: string | null
          id: string
          last_reward_at: string | null
          reward_rate: number | null
          rewards_earned: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          apy_rate?: number | null
          created_at?: string | null
          duration_days?: number | null
          earned_rewards?: number | null
          end_date?: string | null
          id?: string
          last_reward_at?: string | null
          reward_rate?: number | null
          rewards_earned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          apy_rate?: number | null
          created_at?: string | null
          duration_days?: number | null
          earned_rewards?: number | null
          end_date?: string | null
          id?: string
          last_reward_at?: string | null
          reward_rate?: number | null
          rewards_earned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      duacoin_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          description: string | null
          fee: number | null
          from_address: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string | null
          to_address: string | null
          tx_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          description?: string | null
          fee?: number | null
          from_address?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string | null
          to_address?: string | null
          tx_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          description?: string | null
          fee?: number | null
          from_address?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string | null
          to_address?: string | null
          tx_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      duaia_conversations: {
        Row: {
          created_at: string | null
          id: string
          message_count: number | null
          model: string | null
          system_prompt: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_count?: number | null
          model?: string | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_count?: number | null
          model?: string | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      duaia_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          model: string | null
          role: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          model?: string | null
          role: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          model?: string | null
          role?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duaia_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "duaia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      duaia_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          conversations_count: number | null
          created_at: string | null
          display_name: string | null
          id: string
          language: string | null
          messages_count: number | null
          theme: string | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          conversations_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language?: string | null
          messages_count?: number | null
          theme?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          conversations_count?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language?: string | null
          messages_count?: number | null
          theme?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      duaia_projects: {
        Row: {
          code_content: string | null
          conversation_id: string | null
          created_at: string | null
          description: string | null
          framework: string | null
          id: string
          language: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code_content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          framework?: string | null
          id?: string
          language?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code_content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string | null
          framework?: string | null
          id?: string
          language?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duaia_projects_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "duaia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      duaia_transactions: {
        Row: {
          admin_email: string | null
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          operation: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          admin_email?: string | null
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          operation?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          admin_email?: string | null
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          operation?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      duaia_user_balances: {
        Row: {
          created_at: string
          duacoin_balance: number
          servicos_creditos: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duacoin_balance?: number
          servicos_creditos?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duacoin_balance?: number
          servicos_creditos?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      early_access_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          internal_notes: string | null
          invited_at: string | null
          ip_address: string | null
          marketing_consent: boolean | null
          name: string
          newsletter_consent: boolean | null
          priority_level: number | null
          referral_code: string | null
          registered_at: string | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          internal_notes?: string | null
          invited_at?: string | null
          ip_address?: string | null
          marketing_consent?: boolean | null
          name: string
          newsletter_consent?: boolean | null
          priority_level?: number | null
          referral_code?: string | null
          registered_at?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          internal_notes?: string | null
          invited_at?: string | null
          ip_address?: string | null
          marketing_consent?: boolean | null
          name?: string
          newsletter_consent?: boolean | null
          priority_level?: number | null
          referral_code?: string | null
          registered_at?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          app_scope: string
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          max_uses: number
          uses_count: number
        }
        Insert: {
          app_scope?: string
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          max_uses?: number
          uses_count?: number
        }
        Update: {
          app_scope?: string
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          max_uses?: number
          uses_count?: number
        }
        Relationships: []
      }
      kyntal_rewards: {
        Row: {
          admin_id: string | null
          beneficiario_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          objetivo_atingido: string
          status: string | null
          updated_at: string | null
          valor_dua: number
        }
        Insert: {
          admin_id?: string | null
          beneficiario_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          objetivo_atingido: string
          status?: string | null
          updated_at?: string | null
          valor_dua: number
        }
        Update: {
          admin_id?: string | null
          beneficiario_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          objetivo_atingido?: string
          status?: string | null
          updated_at?: string | null
          valor_dua?: number
        }
        Relationships: []
      }
      legacy_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dua_balance: number | null
          email: string | null
          full_name: string | null
          id: string
          is_custodial_user: boolean | null
          role: string | null
          updated_at: string | null
          wallet_address: string | null
          wallet_provider: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dua_balance?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          is_custodial_user?: boolean | null
          role?: string | null
          updated_at?: string | null
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dua_balance?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_custodial_user?: boolean | null
          role?: string | null
          updated_at?: string | null
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Relationships: []
      }
      legacy_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          network: string | null
          payment_method: string | null
          status: string | null
          transaction_type: string
          tx_hash: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_type: string
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_type?: string
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      legacy_wallets: {
        Row: {
          balance: number | null
          balance_dua: number | null
          created_at: string | null
          id: string
          is_custodial: boolean | null
          network: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
          wallet_provider: string | null
        }
        Insert: {
          balance?: number | null
          balance_dua?: number | null
          created_at?: string | null
          id?: string
          is_custodial?: boolean | null
          network?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Update: {
          balance?: number | null
          balance_dua?: number | null
          created_at?: string | null
          id?: string
          is_custodial?: boolean | null
          network?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          error_message: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      market_licenses: {
        Row: {
          created_at: string | null
          download_url: string | null
          downloads_count: number | null
          expires_at: string | null
          id: string
          license_text: string | null
          max_downloads: number | null
          order_item_id: string
        }
        Insert: {
          created_at?: string | null
          download_url?: string | null
          downloads_count?: number | null
          expires_at?: string | null
          id?: string
          license_text?: string | null
          max_downloads?: number | null
          order_item_id: string
        }
        Update: {
          created_at?: string | null
          download_url?: string | null
          downloads_count?: number | null
          expires_at?: string | null
          id?: string
          license_text?: string | null
          max_downloads?: number | null
          order_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_licenses_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "market_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      market_order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number | null
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal?: number | null
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "market_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "market_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "market_products"
            referencedColumns: ["id"]
          },
        ]
      }
      market_orders: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          status: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      market_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reference: string | null
          seller_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reference?: string | null
          seller_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reference?: string | null
          seller_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "market_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      market_products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          media_url: string | null
          price: number
          seller_id: string
          status: string | null
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          media_url?: string | null
          price: number
          seller_id: string
          status?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          media_url?: string | null
          price?: number
          seller_id?: string
          status?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "market_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      market_sellers: {
        Row: {
          about: string | null
          created_at: string | null
          display_name: string | null
          id: string
          payout_info: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          payout_info?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          payout_info?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          bolsa_id: string | null
          created_at: string | null
          doacao_id: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          bolsa_id?: string | null
          created_at?: string | null
          doacao_id?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          bolsa_id?: string | null
          created_at?: string | null
          doacao_id?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_bolsa_id_fkey"
            columns: ["bolsa_id"]
            isOneToOne: false
            referencedRelation: "bolsas_criativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_doacao_id_fkey"
            columns: ["doacao_id"]
            isOneToOne: false
            referencedRelation: "doacoes_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      onchain_events: {
        Row: {
          created_at: string | null
          dua_amount: number
          event_type: string
          id: string
          raw_payload: Json | null
          status: string
          tx_hash: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dua_amount: number
          event_type: string
          id?: string
          raw_payload?: Json | null
          status?: string
          tx_hash: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dua_amount?: number
          event_type?: string
          id?: string
          raw_payload?: Json | null
          status?: string
          tx_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      password_resets: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used: boolean | null
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          used?: boolean | null
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used?: boolean | null
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_dua: number
          amount_eur: number
          completed_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          network: string | null
          payment_method: string | null
          purchase_type: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tx_hash: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          amount_dua: number
          amount_eur: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          payment_method?: string | null
          purchase_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount_dua?: number
          amount_eur?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          payment_method?: string | null
          purchase_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      service_costs: {
        Row: {
          category: string | null
          created_at: string | null
          credits_cost: number
          icon: string | null
          id: string
          is_active: boolean | null
          service_description: string | null
          service_label: string
          service_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          credits_cost?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          service_description?: string | null
          service_label: string
          service_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          credits_cost?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          service_description?: string | null
          service_label?: string
          service_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_costs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_costs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_balance_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "service_costs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          name: string
          price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      sessions_history: {
        Row: {
          browser: string | null
          device_type: string | null
          email: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          location_city: string | null
          location_country: string | null
          logout_type: string | null
          os: string | null
          session_end: string | null
          session_start: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          email: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          location_city?: string | null
          location_country?: string | null
          logout_type?: string | null
          os?: string | null
          session_end?: string | null
          session_start?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          location_city?: string | null
          location_country?: string | null
          logout_type?: string | null
          os?: string | null
          session_end?: string | null
          session_start?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      supply_tracking: {
        Row: {
          circulating_supply: number | null
          id: string
          last_updated: string | null
          total_burned: number | null
          total_minted: number | null
          updated_by: string | null
        }
        Insert: {
          circulating_supply?: number | null
          id?: string
          last_updated?: string | null
          total_burned?: number | null
          total_minted?: number | null
          updated_by?: string | null
        }
        Update: {
          circulating_supply?: number | null
          id?: string
          last_updated?: string | null
          total_burned?: number | null
          total_minted?: number | null
          updated_by?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: number
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_balance_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_creditos: number | null
          amount_dua: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          source_type: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_creditos?: number | null
          amount_dua?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_creditos?: number | null
          amount_dua?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_approval_log: {
        Row: {
          approval_method: string | null
          approved_at: string | null
          approved_by: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          approval_method?: string | null
          approved_at?: string | null
          approved_by?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          approval_method?: string | null
          approved_at?: string | null
          approved_by?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_approval_log_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_approval_log_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_balance_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_approval_log_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_approval_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_approval_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_balance_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_approval_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          app_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string | null
          session_token: string
          started_at: string | null
          terminated_at: string | null
          termination_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token: string
          started_at?: string | null
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_token?: string
          started_at?: string | null
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_locked_until: string | null
          account_type: string | null
          avatar_set: boolean | null
          avatar_url: string | null
          bio: string | null
          chat_images_generated: number | null
          created_at: string | null
          creditos_servicos: number | null
          dua_coin_balance: number | null
          dua_ia_balance: number | null
          duacoin_enabled: boolean | null
          duaia_enabled: boolean | null
          email: string
          email_verified: boolean | null
          email_verified_at: string | null
          failed_login_attempts: number | null
          full_access: boolean | null
          has_access: boolean | null
          id: string
          invite_code_used: string | null
          last_login_at: string | null
          last_login_ip: string | null
          last_session_check: string | null
          name: string | null
          onboarding_completed: boolean | null
          password_changed_at: string | null
          registration_completed: boolean | null
          registration_ip: string | null
          registration_user_agent: string | null
          role: string | null
          saldo_dua: number | null
          session_active: boolean | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          username: string | null
          username_set: boolean | null
          welcome_seen: boolean | null
        }
        Insert: {
          account_locked_until?: string | null
          account_type?: string | null
          avatar_set?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          chat_images_generated?: number | null
          created_at?: string | null
          creditos_servicos?: number | null
          dua_coin_balance?: number | null
          dua_ia_balance?: number | null
          duacoin_enabled?: boolean | null
          duaia_enabled?: boolean | null
          email: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_access?: boolean | null
          has_access?: boolean | null
          id: string
          invite_code_used?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_session_check?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          password_changed_at?: string | null
          registration_completed?: boolean | null
          registration_ip?: string | null
          registration_user_agent?: string | null
          role?: string | null
          saldo_dua?: number | null
          session_active?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          username_set?: boolean | null
          welcome_seen?: boolean | null
        }
        Update: {
          account_locked_until?: string | null
          account_type?: string | null
          avatar_set?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          chat_images_generated?: number | null
          created_at?: string | null
          creditos_servicos?: number | null
          dua_coin_balance?: number | null
          dua_ia_balance?: number | null
          duacoin_enabled?: boolean | null
          duaia_enabled?: boolean | null
          email?: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          failed_login_attempts?: number | null
          full_access?: boolean | null
          has_access?: boolean | null
          id?: string
          invite_code_used?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_session_check?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          password_changed_at?: string | null
          registration_completed?: boolean | null
          registration_ip?: string | null
          registration_user_agent?: string | null
          role?: string | null
          saldo_dua?: number | null
          session_active?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          username_set?: boolean | null
          welcome_seen?: boolean | null
        }
        Relationships: []
      }
      vault_reconciliation: {
        Row: {
          created_at: string | null
          difference: number | null
          id: string
          is_balanced: boolean | null
          metadata: Json | null
          snapshot_date: string | null
          total_virtual_all: number | null
          total_virtual_bolsas: number | null
          total_virtual_reserved: number | null
          total_virtual_users: number | null
          vault_address: string | null
          vault_real_balance: number | null
        }
        Insert: {
          created_at?: string | null
          difference?: number | null
          id?: string
          is_balanced?: boolean | null
          metadata?: Json | null
          snapshot_date?: string | null
          total_virtual_all?: number | null
          total_virtual_bolsas?: number | null
          total_virtual_reserved?: number | null
          total_virtual_users?: number | null
          vault_address?: string | null
          vault_real_balance?: number | null
        }
        Update: {
          created_at?: string | null
          difference?: number | null
          id?: string
          is_balanced?: boolean | null
          metadata?: Json | null
          snapshot_date?: string | null
          total_virtual_all?: number | null
          total_virtual_bolsas?: number | null
          total_virtual_reserved?: number | null
          total_virtual_users?: number | null
          vault_address?: string | null
          vault_real_balance?: number | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      web3_purchases: {
        Row: {
          amount_aptm: number | null
          amount_dua: number | null
          block_number: number | null
          confirmations: number | null
          confirmed_at: string | null
          created_at: string | null
          detected_at: string | null
          id: string
          metadata: Json | null
          network: string | null
          status: string | null
          synced_to_db: boolean | null
          tx_hash: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          amount_aptm?: number | null
          amount_dua?: number | null
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          status?: string | null
          synced_to_db?: boolean | null
          tx_hash: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          amount_aptm?: number | null
          amount_dua?: number | null
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          metadata?: Json | null
          network?: string | null
          status?: string | null
          synced_to_db?: boolean | null
          tx_hash?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_suspicious_transactions: {
        Row: {
          amount: number | null
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          status: string | null
          type: string | null
        }
        Relationships: []
      }
      admin_top_dua_holders: {
        Row: {
          balance: number | null
          email: string | null
          last_transaction: string | null
          total_earned: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      admin_user_stats: {
        Row: {
          created_at: string | null
          dua_balance: number | null
          dua_earned: number | null
          dua_spent: number | null
          duaia_conversations: number | null
          duaia_messages: number | null
          email: string | null
          id: string | null
          last_sign_in_at: string | null
          role: string | null
          transaction_count: number | null
        }
        Relationships: []
      }
      community_posts_with_user: {
        Row: {
          comments_count: number | null
          created_at: string | null
          description: string | null
          firebase_path: string | null
          id: string | null
          likes_count: number | null
          media_url: string | null
          thumbnail_url: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_avatar_url: string | null
          user_id: string | null
          user_name: string | null
          user_username: string | null
        }
        Relationships: []
      }
      email_queue_stats: {
        Row: {
          avg_attempts: number | null
          count: number | null
          email_type: string | null
          newest: string | null
          oldest: string | null
          status: string | null
        }
        Relationships: []
      }
      user_balance_summary: {
        Row: {
          creditos_servicos: number | null
          email: string | null
          name: string | null
          saldo_dua: number | null
          total_compras: number | null
          total_creditos_comprados: number | null
          total_creditos_gastos: number | null
          total_gastos: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_coins:
        | { Args: { amount: number; user_id: string }; Returns: undefined }
        | { Args: { amount: number; user_id: string }; Returns: undefined }
      add_credits_simple: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      add_dua_coins:
        | { Args: { amount: number; target_user_id: string }; Returns: Json }
        | { Args: { amount: number; user_id: string }; Returns: undefined }
        | {
            Args: { amount: number; target_user_id: string }
            Returns: undefined
          }
      add_purchased_coins: {
        Args: { amount: number; payment_id: string; user_id: string }
        Returns: undefined
      }
      add_servicos_credits: {
        Args: {
          p_admin_email?: string
          p_amount: number
          p_description?: string
          p_metadata?: Json
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_add_coins: {
        Args: { amount: number; description?: string; target_user_id: string }
        Returns: undefined
      }
      admin_create_beneficiary_artist: {
        Args: { p_artist_name: string; p_metadata?: Json; p_user_id: string }
        Returns: undefined
      }
      admin_fix_balance: {
        Args: { p_new_balance: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_inject_dua: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: undefined
      }
      approve_user: { Args: { user_id: string }; Returns: boolean }
      bulk_approve_users: { Args: { user_ids: string[] }; Returns: number }
      burn_bolsa_dua: {
        Args: {
          p_amount: number
          p_bolsa_id: string
          p_burned_by: string
          p_reason: string
          p_studio_payment_amount: number
          p_studio_payment_reference: string
        }
        Returns: Json
      }
      calculate_current_supply: {
        Args: never
        Returns: {
          circulating_supply: number
          total_burned: number
          total_minted: number
        }[]
      }
      check_admin_permission: {
        Args: { p_permission_name: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_email: string; p_ip: string }
        Returns: {
          attempts_count: number
          is_allowed: boolean
          wait_minutes: number
        }[]
      }
      check_servicos_credits: {
        Args: { p_required_amount: number; p_user_id: string }
        Returns: Json
      }
      clean_expired_password_resets: { Args: never; Returns: undefined }
      clean_old_login_attempts: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_sent_emails: { Args: never; Returns: number }
      count_early_access_subscribers: {
        Args: never
        Returns: {
          invited: number
          registered: number
          total: number
          waiting: number
        }[]
      }
      create_admin_profile: { Args: never; Returns: undefined }
      current_app_role: { Args: never; Returns: string }
      decrement_likes_count: { Args: { post_id: string }; Returns: undefined }
      deduct_credits_simple: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      deduct_dua_transaction: {
        Args: {
          p_amount: number
          p_description: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: {
          error_message: string
          new_balance: number
          success: boolean
          transaction_id: string
        }[]
      }
      deduct_servicos_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_metadata?: Json
          p_operation?: string
          p_user_id: string
        }
        Returns: Json
      }
      ensure_duacoin_account: { Args: { p_user_id: string }; Returns: string }
      exists_admin: { Args: { uid: string }; Returns: boolean }
      get_admin_stats: { Args: never; Returns: Json }
      get_custom_email_history: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          error_message: string
          id: string
          message: string
          recipient_email: string
          recipient_name: string
          sent_at: string
          status: string
          subject: string
        }[]
      }
      get_pending_emails: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          email: string
          id: string
          template_data: Json
          template_type: string
          user_id: string
        }[]
      }
      get_pending_users: {
        Args: never
        Returns: {
          created_at: string
          days_waiting: number
          email: string
          id: string
          name: string
        }[]
      }
      get_service_cost: { Args: { p_service_name: string }; Returns: number }
      get_servicos_credits: { Args: { p_user_id: string }; Returns: number }
      get_user_dua_balance: { Args: { user_id: string }; Returns: number }
      get_users_for_email: {
        Args: never
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          full_name: string
          id: string
          role: string
        }[]
      }
      increment_likes_count: { Args: { post_id: string }; Returns: undefined }
      increment_user_saldo: {
        Args: { amount: number; uid: string }
        Returns: undefined
      }
      is_admin:
        | { Args: { user_id: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_user_id: string
          p_details?: Json
          p_target_user_id?: string
        }
        Returns: string
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_ip_address?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      mark_email_failed: {
        Args: { p_email_id: string; p_error_message: string }
        Returns: undefined
      }
      mark_email_sent: {
        Args: {
          p_email_id: string
          p_error_message?: string
          p_success: boolean
        }
        Returns: undefined
      }
      mark_subscriber_as_invited: {
        Args: { subscriber_email: string }
        Returns: boolean
      }
      migrate_subscriber_to_user: {
        Args: { subscriber_email: string; user_id: string }
        Returns: boolean
      }
      process_email_queue: {
        Args: { p_batch_size?: number }
        Returns: {
          failed_count: number
          processed_count: number
          success_count: number
        }[]
      }
      recalculate_user_balance: { Args: { user_uuid: string }; Returns: number }
      reconcile_vault_balance: {
        Args: never
        Returns: {
          difference: number
          is_balanced: boolean
          total_virtual: number
          vault_real: number
        }[]
      }
      resend_welcome_email: { Args: { p_user_id: string }; Returns: string }
      send_custom_email: {
        Args: {
          p_message: string
          p_sender_name?: string
          p_subject: string
          p_user_ids: string[]
        }
        Returns: {
          queued_count: number
          user_emails: string[]
        }[]
      }
      terminate_user_sessions: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: number
      }
      update_service_cost: {
        Args: {
          p_admin_email?: string
          p_new_cost: number
          p_service_name: string
        }
        Returns: Json
      }
      validate_active_session: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
