import { NextRequest, NextResponse } from 'next/server'
import { detectIngredients } from '@/lib/api'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
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

    const ingredients = await detectIngredients(imageUrl)
    
    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error('Error in detect-ingredients API:', error)
    return NextResponse.json(
      { error: 'Failed to detect ingredients using Claude Vision' },
      { status: 500 }
    )
  }
}