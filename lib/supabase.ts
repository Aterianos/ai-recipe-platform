import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types based on our database schema
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  image_url?: string
  category: string
  estimated_time?: string
  servings?: number
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
  recipe?: Recipe
}

export interface IngredientQuery {
  id: string
  user_id: string
  image_url: string
  recognized_ingredients: string[]
  created_at: string
}