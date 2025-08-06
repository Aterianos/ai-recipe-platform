import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Sparkles, Heart, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Turn Your Ingredients Into
              <span className="text-primary"> Amazing Recipes</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Simply snap a photo of your ingredients and let AI discover the perfect recipes for you. 
              Never wonder &quot;what to cook&quot; again.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/upload">
                <Camera className="mr-2 h-5 w-5" />
                Start Cooking
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/recipes">
                Browse Recipes
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
              Three simple steps to discover your next favorite meal
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Camera className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>1. Upload Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Take a photo of your available ingredients using your phone or camera. 
                  Our AI can identify multiple ingredients at once.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>2. AI Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Our advanced AI recognizes your ingredients and suggests creative recipes 
                  that make the most of what you have.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>3. Cook & Enjoy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Follow step-by-step instructions, save your favorites, 
                  and never run out of cooking inspiration again.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Why Choose Recipe AI?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Save Time</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No more browsing through hundreds of recipes. Get instant suggestions based on what you have.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Reduce Food Waste</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Use up ingredients before they go bad with smart recipe suggestions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Discover New Flavors</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Explore creative combinations you might never have thought of.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Ready to get started?</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Join thousands of home cooks who have discovered the joy of AI-powered cooking.
                </p>
                <Button asChild size="lg">
                  <Link href="/upload">
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Your First Photo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}