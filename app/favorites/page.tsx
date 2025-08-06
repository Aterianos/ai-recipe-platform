'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, Users, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, type Recipe, type Favorite } from '@/lib/supabase'
import Link from 'next/link'

interface FavoriteWithRecipe extends Favorite {
  recipe: Recipe
}

export default function FavoritesPage() {
  const { user } = useAuth()
  
  const [favorites, setFavorites] = useState<FavoriteWithRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setIsLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Filter out any favorites where the recipe was deleted
      const validFavorites = (data || []).filter(fav => fav.recipe) as FavoriteWithRecipe[]
      setFavorites(validFavorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
      toast.success('Removed from favorites')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove from favorites')
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-500 mb-8">Please sign in to view your favorite recipes.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Your Favorite Recipes
          </h1>
          <p className="text-gray-500">
            Keep track of recipes you love and want to cook again
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
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
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {favorites.length} favorite recipe{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <Card key={favorite.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{favorite.recipe.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {favorite.recipe.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id)}
                        className="shrink-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>{favorite.recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {favorite.recipe.estimated_time || '30 minutes'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {favorite.recipe.servings || 4} servings
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="text-sm space-y-1">
                        {favorite.recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                          <li key={idx} className="text-gray-600">• {ingredient}</li>
                        ))}
                        {favorite.recipe.ingredients.length > 5 && (
                          <li className="text-gray-500">+ {favorite.recipe.ingredients.length - 5} more...</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Instructions:</h4>
                      <ol className="text-sm space-y-1">
                        {favorite.recipe.steps.slice(0, 3).map((step, idx) => (
                          <li key={idx} className="text-gray-600">
                            {idx + 1}. {step.length > 60 ? `${step.substring(0, 60)}...` : step}
                          </li>
                        ))}
                        {favorite.recipe.steps.length > 3 && (
                          <li className="text-gray-500">+ {favorite.recipe.steps.length - 3} more steps...</li>
                        )}
                      </ol>
                    </div>

                    <div className="text-xs text-gray-400">
                      Saved on {new Date(favorite.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-8">
              Start exploring recipes and save the ones you love by clicking the heart icon
            </p>
            <div className="space-x-2">
              <Button asChild>
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/upload">Create Recipe</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}