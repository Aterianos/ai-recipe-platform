'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, Clock, Users, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, type Recipe } from '@/lib/supabase'


import Link from 'next/link'

export default function RecipesPage() {
  const { user } = useAuth()
  
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const categories = ['all', 'main dish', 'appetizer', 'dessert', 'side dish']

  useEffect(() => {
    fetchRecipes()
    if (user) {
      fetchFavorites()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterRecipes()
  }, [recipes, searchTerm, categoryFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast.error('Failed to load recipes')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return

    try {
      // First get all favorite recipe IDs
      const { data: favoriteData, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id)

      if (error) throw error

      if (!favoriteData || favoriteData.length === 0) {
        setFavorites(new Set())
        return
      }

      // Then get the recipe titles for those IDs
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('id, title')
        .in('id', favoriteData.map(fav => fav.recipe_id))

      if (recipeError) throw recipeError

      const favoriteRecipeIds = new Set(
        recipeData?.map(recipe => recipe.title) || []
      )
      setFavorites(favoriteRecipeIds)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const filterRecipes = () => {
    let filtered = recipes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === categoryFilter)
    }

    setFilteredRecipes(filtered)
  }

  const toggleFavorite = async (recipe: Recipe) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id)
        .single()

      if (existingFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id)
        
        setFavorites(prev => {
          const newFavorites = new Set(prev)
          newFavorites.delete(recipe.title)
          return newFavorites
        })
        toast.success('Removed from favorites')
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipe.id
          })
        
        setFavorites(prev => new Set([...prev, recipe.title]))
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Browse Recipes</h1>
          <p className="text-gray-500">
            Discover delicious recipes from our community and AI-generated suggestions
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes, ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : 
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${filteredRecipes.length} recipes found`}
          </p>
          <Button asChild>
            <Link href="/upload">Create New Recipe</Link>
          </Button>
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {recipe.category}
                      </Badge>
                    </div>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(recipe)}
                        className="shrink-0"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            favorites.has(recipe.title) 
                              ? 'fill-red-500 text-red-500' 
                              : ''
                          }`} 
                        />
                      </Button>
                    )}
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.estimated_time || '30 minutes'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings || 4} servings
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="text-sm space-y-1">
                      {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                        <li key={idx} className="text-gray-600">• {ingredient}</li>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <li className="text-gray-500">+ {recipe.ingredients.length - 5} more...</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ol className="text-sm space-y-1">
                      {recipe.steps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="text-gray-600">
                          {idx + 1}. {step.length > 60 ? `${step.substring(0, 60)}...` : step}
                        </li>
                      ))}
                      {recipe.steps.length > 3 && (
                        <li className="text-gray-500">+ {recipe.steps.length - 3} more steps...</li>
                      )}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No recipes found</h2>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to add a recipe!'}
            </p>
            <div className="space-x-2">
              {(searchTerm || categoryFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button asChild>
                <Link href="/upload">Upload Ingredients</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}