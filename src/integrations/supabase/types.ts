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
      orders: {
        Row: {
          created_at: string | null
          customer_info: Json
          delivery_date: string
          delivery_location: string
          id: string
          product_id: string
          status: string
          total_amount: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          customer_info: Json
          delivery_date: string
          delivery_location: string
          id?: string
          product_id: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          customer_info?: Json
          delivery_date?: string
          delivery_location?: string
          id?: string
          product_id?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          color: string
          created_at: string | null
          description: string
          discount_end: string | null
          discount_price: number | null
          discount_start: string | null
          id: string
          images: string[] | null
          is_hottest_offer: boolean | null
          name: string
          price: number
          size: string
          stock_quantity: number
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          description: string
          discount_end?: string | null
          discount_price?: number | null
          discount_start?: string | null
          id?: string
          images?: string[] | null
          is_hottest_offer?: boolean | null
          name: string
          price: number
          size: string
          stock_quantity: number
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          description?: string
          discount_end?: string | null
          discount_price?: number | null
          discount_start?: string | null
          id?: string
          images?: string[] | null
          is_hottest_offer?: boolean | null
          name?: string
          price?: number
          size?: string
          stock_quantity?: number
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendors: {
        Row: {
          banner_image_url: string | null
          bio: string | null
          created_at: string | null
          facebook_url: string | null
          instagram_url: string | null
          name: string
          payout_info: Json | null
          phone: string | null
          store_name: string
          updated_at: string | null
          user_id: string
          wabusiness_url: string | null
        }
        Insert: {
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          name: string
          payout_info?: Json | null
          phone?: string | null
          store_name: string
          updated_at?: string | null
          user_id: string
          wabusiness_url?: string | null
        }
        Update: {
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          name?: string
          payout_info?: Json | null
          phone?: string | null
          store_name?: string
          updated_at?: string | null
          user_id?: string
          wabusiness_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Categories:
        | "Clothing"
        | "Accessories"
        | "Footwear"
        | "Bags"
        | "Jewelry"
        | "Beauty"
        | "Home Decor"
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
      Categories: [
        "Clothing",
        "Accessories",
        "Footwear",
        "Bags",
        "Jewelry",
        "Beauty",
        "Home Decor",
      ],
    },
  },
} as const
