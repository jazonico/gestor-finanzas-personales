export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          date: string;
          is_recurring: boolean;
          recurring_day: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          date: string;
          is_recurring?: boolean;
          recurring_day?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'income' | 'expense';
          category?: string;
          amount?: number;
          description?: string;
          date?: string;
          is_recurring?: boolean;
          recurring_day?: number | null;
        };
      };
      recurring_payments: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          category: string;
          day_of_month: number;
          is_active: boolean;
          type: 'expense' | 'income';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          category: string;
          day_of_month: number;
          is_active?: boolean;
          type: 'expense' | 'income';
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          category?: string;
          day_of_month?: number;
          is_active?: boolean;
          type?: 'expense' | 'income';
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 