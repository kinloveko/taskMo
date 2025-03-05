import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ganoalptwvcyxozgjegm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdhbm9hbHB0d3ZjeXhvemdqZWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjczNzAsImV4cCI6MjA1NjY0MzM3MH0.06Uy4ozHTpJhqhpcg2MvFNu83RYW2XVvkMEN6JAkT9I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
