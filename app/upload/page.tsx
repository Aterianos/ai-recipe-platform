'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, X, Plus, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { type DetectedIngredient } from '@/lib/api'
import Image from 'next/image'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([])
  const [editableIngredients, setEditableIngredients] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newIngredient, setNewIngredient] = useState('')

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Reset previous results
    setDetectedIngredients([])
    setEditableIngredients([])
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `ingredient-photos/${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      throw new Error('Failed to upload image')
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const analyzeIngredients = async () => {
    if (!selectedImage || !user) {
      toast.error('Please select an image and sign in')
      return
    }

    setIsAnalyzing(true)

    try {
      // Upload image to Supabase storage
      const imageUrl = await uploadImageToSupabase(selectedImage)
      
      // Detect ingredients using AI via API route
      const response = await fetch('/api/detect-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to detect ingredients')
      }

      const { ingredients } = await response.json()
      
      setDetectedIngredients(ingredients)
      setEditableIngredients(ingredients.map((ingredient: DetectedIngredient) => ingredient.name))

      // Save the query to database
      await supabase
        .from('ingredient_queries')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          recognized_ingredients: ingredients.map((ingredient: DetectedIngredient) => ingredient.name)
        })

      toast.success(`Detected ${ingredients.length} ingredients!`)
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast.error('Failed to analyze ingredients. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addIngredient = () => {
    if (newIngredient.trim() && !editableIngredients.includes(newIngredient.trim())) {
      setEditableIngredients([...editableIngredients, newIngredient.trim()])
      setNewIngredient('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setEditableIngredients(editableIngredients.filter(i => i !== ingredient))
  }

  const generateRecipes = async () => {
    if (!editableIngredients.length) {
      toast.error('Please add some ingredients first')
      return
    }

    setIsGenerating(true)

    try {
      // Navigate to results page with ingredients
      const params = new URLSearchParams({
        ingredients: JSON.stringify(editableIngredients)
      })
      router.push(`/recipes/generate?${params.toString()}`)
    } catch (error) {
      console.error('Error generating recipes:', error)
      toast.error('Failed to generate recipes')
      setIsGenerating(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-500 mb-8">Please sign in to upload photos and get recipe suggestions.</p>
        <Button asChild>
          <a href="/auth/signin">Sign In</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Upload Your Ingredients</h1>
          <p className="text-gray-500">
            Take a photo or upload an image of your ingredients to get AI-powered recipe suggestions
          </p>
        </div>

        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Add Your Photo</CardTitle>
            <CardDescription>
              Upload a clear photo showing all your available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!imagePreview ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8" />
                  <span>Upload Image</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Selected ingredients"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      setDetectedIngredients([])
                      setEditableIngredients([])
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={analyzeIngredients}
                    disabled={isAnalyzing}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Ingredients
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        {(detectedIngredients.length > 0 || editableIngredients.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Review & Edit Ingredients</CardTitle>
              <CardDescription>
                Confirm the detected ingredients and add any missing ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {detectedIngredients.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Detected Ingredients:</h3>
                  <div className="flex flex-wrap gap-2">
                    {detectedIngredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {ingredient.name}
                        <span className="ml-1 text-xs opacity-75">
                          ({Math.round(ingredient.confidence * 100)}%)
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ingredient manually..."
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                  <Button onClick={addIngredient} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {editableIngredients.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Your Ingredients:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editableIngredients.map((ingredient, index) => (
                        <Badge key={index} variant="default" className="text-sm">
                          {ingredient}
                          <button
                            onClick={() => removeIngredient(ingredient)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {editableIngredients.length > 0 && (
                <div className="text-center pt-4">
                  <Button
                    onClick={generateRecipes}
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Recipes...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Recipes ({editableIngredients.length} ingredients)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}