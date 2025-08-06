import { NextRequest, NextResponse } from 'next/server'
import { generateRecipe } from '@/lib/api'

export const maxDuration = 30

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

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder-key') {
      return NextResponse.json(
        { error: 'Claude API key not configured. Please add your ANTHROPIC_API_KEY to environment variables.' },
        { status: 500 }
      )
    }

    const recipes = await generateRecipe(ingredients)
    
    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('Error in generate-recipes API:', error)
    return NextResponse.json(
      { error: 'Failed to generate recipes using Claude' },
      { status: 500 }
    )
  }
}