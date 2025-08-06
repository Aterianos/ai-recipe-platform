-- Database Schema for AI Recipe Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth handles this automatically)
-- We'll reference auth.users table

-- Profiles table (extends auth.users with additional user information)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL,
    steps TEXT[] NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100) NOT NULL DEFAULT 'main dish',
    estimated_time VARCHAR(50),
    servings INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- Ingredient queries table (for tracking user uploaded images and detected ingredients)
CREATE TABLE ingredient_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    recognized_ingredients TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_user_name ON profiles(user_name);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX idx_ingredient_queries_user_id ON ingredient_queries(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT 
    USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE 
    USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Recipes: Public read, authenticated users can create
CREATE POLICY "Recipes are viewable by everyone" ON recipes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create recipes" ON recipes FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Favorites: Users can only access their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- Ingredient queries: Users can only access their own queries
CREATE POLICY "Users can view their own ingredient queries" ON ingredient_queries FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ingredient queries" ON ingredient_queries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Sample data
INSERT INTO recipes (title, description, ingredients, steps, category, estimated_time, servings) VALUES
    (
        'Classic Tomato Pasta',
        'A simple and delicious tomato-based pasta dish',
        ARRAY['400g pasta', '2 large tomatoes', '1 onion', '3 cloves garlic', 'olive oil', 'salt', 'black pepper', 'fresh basil'],
        ARRAY[
            'Bring a large pot of salted water to boil and cook pasta according to package directions',
            'Heat olive oil in a large pan over medium heat',
            'Add diced onion and cook until translucent, about 5 minutes',
            'Add minced garlic and cook for 1 minute',
            'Add diced tomatoes and cook until they break down, about 10 minutes',
            'Season with salt and pepper',
            'Drain pasta and add to the sauce',
            'Toss to combine and serve with fresh basil'
        ],
        'main dish',
        '25 minutes',
        4
    ),
    (
        'Roasted Vegetable Medley',
        'Colorful roasted vegetables perfect as a side dish',
        ARRAY['2 bell peppers', '1 zucchini', '1 red onion', '2 carrots', 'olive oil', 'salt', 'pepper', 'dried herbs'],
        ARRAY[
            'Preheat oven to 425°F (220°C)',
            'Cut all vegetables into similar-sized pieces',
            'Toss vegetables with olive oil, salt, pepper, and herbs',
            'Arrange on a baking sheet in a single layer',
            'Roast for 25-30 minutes until tender and lightly browned',
            'Serve immediately'
        ],
        'side dish',
        '35 minutes',
        6
    ),
    (
        'Fresh Garden Salad',
        'A light and refreshing salad with seasonal vegetables',
        ARRAY['mixed greens', '1 cucumber', '2 tomatoes', '1 carrot', 'olive oil', 'lemon juice', 'salt', 'pepper'],
        ARRAY[
            'Wash and dry the mixed greens',
            'Slice cucumber and tomatoes',
            'Grate or julienne the carrot',
            'Combine all vegetables in a large bowl',
            'Whisk together olive oil, lemon juice, salt, and pepper',
            'Dress the salad just before serving'
        ],
        'appetizer',
        '10 minutes',
        4
    );