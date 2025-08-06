'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Heart, Clock, Sparkles } from 'lucide-react'
import { supabase, type IngredientQuery } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalFavorites: 0,
    recentQueries: [] as IngredientQuery[]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    } else {
      setIsLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserStats = async () => {
    if (!user) return

    try {
      // Fetch ingredient queries count and recent queries
      const [queriesResponse, favoritesResponse] = await Promise.all([
        supabase
          .from('ingredient_queries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
      ])

      const totalQueries = queriesResponse.data?.length || 0
      const totalFavorites = favoritesResponse.data?.length || 0
      const recentQueries = queriesResponse.data || []

      setStats({
        totalQueries,
        totalFavorites,
        recentQueries
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-500 mb-8">Please sign in to view your profile.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-primary-foreground text-xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">{stats.totalQueries}</CardTitle>
              <CardDescription>Photos Analyzed</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">{stats.totalFavorites}</CardTitle>
              <CardDescription>Favorite Recipes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                {new Date(user.created_at || '').toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>Member Since</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Ingredient Queries</CardTitle>
            <CardDescription>
              Your latest photo analyses and ingredient detections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentQueries.length > 0 ? (
              <div className="space-y-4">
                {stats.recentQueries.map((query) => (
                  <div key={query.id} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(query.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {query.recognized_ingredients.map((ingredient, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No ingredient queries yet</p>
                <Button asChild>
                  <Link href="/upload">Upload Your First Photo</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with discovering new recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button asChild className="h-16">
                <Link href="/upload" className="flex flex-col gap-1">
                  <Camera className="h-5 w-5" />
                  <span>Upload Ingredients</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-16">
                <Link href="/favorites" className="flex flex-col gap-1">
                  <Heart className="h-5 w-5" />
                  <span>View Favorites</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-16">
                <Link href="/recipes" className="flex flex-col gap-1">
                  <Sparkles className="h-5 w-5" />
                  <span>Browse Recipes</span>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1"
                onClick={() => window.location.reload()}
              >
                <Clock className="h-5 w-5" />
                <span>Refresh Stats</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-sm">
                {new Date(user.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-xs font-mono text-gray-400 break-all">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}