'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, Clock, Users, ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { type GeneratedRecipe } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function GenerateRecipesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [ingredients, setIngredients] = useState<string[]>([])
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const ingredientsParam = searchParams.get('ingredients')
    if (ingredientsParam) {
      try {
        const parsedIngredients = JSON.parse(ingredientsParam)
        setIngredients(parsedIngredients)
        generateRecipes(parsedIngredients)
      } catch (error) {
        console.error('Error parsing ingredients:', error)
        toast.error('Invalid ingredients data')
        router.push('/upload')
      }
    } else {
      router.push('/upload')
    }
  }, [searchParams, router])

  const generateRecipes = async (ingredientList: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientList }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate recipes')
      }

      const { recipes: generatedRecipes } = await response.json()
      setRecipes(generatedRecipes)
      
      // Save recipes to database
      for (const recipe of generatedRecipes) {
        await supabase
          .from('recipes')
          .insert({
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            category: recipe.category,
            estimated_time: recipe.estimatedTime,
            servings: recipe.servings
          })
      }
      
      toast.success('Recipes generated successfully!')
    } catch (error) {
      console.error('Error generating recipes:', error)
      toast.error('Failed to generate recipes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (recipe: GeneratedRecipe) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      // First, find or create the recipe in the database
      const { data: existingRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('id')
        .eq('title', recipe.title)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      let recipeId = existingRecipe?.id

      if (!recipeId) {
        // Create the recipe if it doesn't exist
        const { data: newRecipe, error: insertError } = await supabase
          .from('recipes')
          .insert({
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            category: recipe.category,
            estimated_time: recipe.estimatedTime,
            servings: recipe.servings
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        recipeId = newRecipe.id
      }

      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
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
            recipe_id: recipeId
          })
        
        setFavorites(prev => new Set([...prev, recipe.title]))
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-500 mb-8">Please sign in to generate recipes.</p>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/upload">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
            <p className="text-gray-500">Based on your ingredients</p>
          </div>
        </div>

        {/* Ingredients Used */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Generating Recipes...</h2>
            <p className="text-gray-500">Our AI is creating personalized recipes for you</p>
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && recipes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {recipe.category}
                      </Badge>
                    </div>
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
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings} servings
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
        )}

        {/* No Recipes State */}
        {!isLoading && recipes.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No recipes generated</h2>
            <p className="text-gray-500 mb-4">
              Sorry, we couldn&apos;t generate recipes with your ingredients. Try adding more ingredients.
            </p>
            <Button asChild>
              <Link href="/upload">Try Again</Link>
            </Button>
          </div>
        )}

        {/* Actions */}
        {recipes.length > 0 && (
          <div className="text-center space-y-4">
            <Button asChild variant="outline">
              <Link href="/upload">Generate More Recipes</Link>
            </Button>
            <p className="text-sm text-gray-500">
              Want different suggestions? Upload a new photo or try different ingredients.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}