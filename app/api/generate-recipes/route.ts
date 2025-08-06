import { NextRequest, NextResponse } from 'next/server'
import { generateRecipe } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredients } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      )
    }

    const recipes = await generateRecipe(ingredients)
    
    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Error in generate-recipes API:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    )
  }
}