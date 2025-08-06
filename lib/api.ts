import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface DetectedIngredient {
  name: string
  confidence: number
}

/**
 * Detect ingredients in an image using Claude Vision API
 */
export async function detectIngredients(imageUrl: string): Promise<DetectedIngredient[]> {
  try {
    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    
    // Map content type to allowed Claude formats
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    let mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    
    if (contentType.includes('png')) {
      mimeType = 'image/png'
    } else if (contentType.includes('gif')) {
      mimeType = 'image/gif'
    } else if (contentType.includes('webp')) {
      mimeType = 'image/webp'
    } else {
      // Default to jpeg for unknown types or jpeg
      mimeType = 'image/jpeg'
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analyze this image and identify all food ingredients visible. 
              Return a JSON array of objects with "name" and "confidence" (0-1) for each ingredient.
              Only include actual food ingredients, not cookware or utensils.
              Be specific (e.g., "red bell pepper" instead of just "pepper").
              
              Example format:
              [{"name": "tomato", "confidence": 0.95}, {"name": "red onion", "confidence": 0.87}]`
            },
          ],
        },
      ],
    })

    const contentBlock = response.content[0]
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }
    const content = contentBlock.text

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Claude')
    }

    const ingredients = JSON.parse(jsonMatch[0]) as DetectedIngredient[]
    return ingredients.filter(ingredient => ingredient.confidence > 0.3) // Filter low confidence
  } catch (error) {
    console.error('Error detecting ingredients:', error)
    throw new Error('Failed to detect ingredients')
  }
}

export interface GeneratedRecipe {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  category: string
  estimatedTime: string
  servings: number
}

/**
 * Generate recipe suggestions based on detected ingredients
 */
export async function generateRecipe(ingredients: string[]): Promise<GeneratedRecipe[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: `You are a helpful chef assistant. Generate creative and practical recipes using the provided ingredients. 
      Assume basic pantry staples are available: salt, pepper, oil, water, common spices.
      Return exactly 3 different recipe suggestions as a JSON array.`,
      messages: [
        {
          role: "user",
          content: `Create recipes using these ingredients: ${ingredients.join(', ')}
          
          Return a JSON array with this exact format:
          [
            {
              "title": "Recipe Name",
              "description": "Brief description",
              "ingredients": ["ingredient with quantity", "..."],
              "steps": ["step 1", "step 2", "..."],
              "category": "main dish|appetizer|dessert|side dish",
              "estimatedTime": "30 minutes",
              "servings": 4
            }
          ]`
        },
      ],
    })

    const contentBlock = response.content[0]
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }
    const content = contentBlock.text

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Claude')
    }

    const recipes = JSON.parse(jsonMatch[0]) as GeneratedRecipe[]
    return recipes
  } catch (error) {
    console.error('Error generating recipes:', error)
    throw new Error('Failed to generate recipes')
  }
}