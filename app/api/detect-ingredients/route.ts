import { NextRequest, NextResponse } from 'next/server'
import { detectIngredients } from '@/lib/api'

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

    const ingredients = await detectIngredients(imageUrl)
    
    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error('Error in detect-ingredients API:', error)
    return NextResponse.json(
      { error: 'Failed to detect ingredients' },
      { status: 500 }
    )
  }
}