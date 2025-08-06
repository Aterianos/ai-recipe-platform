# Recipe AI - Multi-Ingredient Recipe Suggestion Platform

A modern web application that uses AI to detect ingredients from photos and suggest personalized recipes. Built with Next.js 15, React 19, Supabase, and OpenAI.

## 🚀 Features

- **AI-Powered Ingredient Detection**: Upload photos to automatically identify multiple ingredients
- **Smart Recipe Generation**: Get personalized recipe suggestions based on your ingredients
- **User Authentication**: Secure sign-up/sign-in with email/password and Google OAuth
- **Recipe Management**: Browse, search, and save your favorite recipes
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Real-time Data**: Powered by Supabase for instant updates

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with modern hooks
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **Radix UI** for accessible primitives

### Backend & Database
- **Supabase** for PostgreSQL database, authentication, and file storage
- **Row Level Security (RLS)** for data protection

### AI & APIs
- **OpenAI GPT-4o-mini** for ingredient detection and recipe generation
- **Supabase Storage** for image uploads

### State Management
- **React Query (TanStack Query)** for server state
- **Zustand** for client state (if needed)

## 🏗 Architecture

```
recipe-sharing/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── detect-ingredients/   # AI ingredient detection
│   │   └── generate-recipes/     # AI recipe generation
│   ├── auth/                     # Authentication pages
│   ├── recipes/                  # Recipe browsing & generation
│   ├── upload/                   # Photo upload page
│   ├── favorites/                # User favorites
│   └── profile/                  # User profile
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── header.tsx               # Navigation header
│   └── providers.tsx            # React Query provider
├── lib/                         # Utility libraries
│   ├── supabase.ts             # Supabase client & types
│   ├── auth.ts                 # Authentication hooks
│   ├── api.ts                  # AI API functions
│   └── utils.ts                # Utility functions
└── supabase-schema.sql         # Database schema
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-sharing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
   
   Update the variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # Copy the contents of supabase-schema.sql to Supabase SQL Editor
   ```

5. **Configure Supabase Storage**
   
   Create a storage bucket named `images`:
   - Go to Supabase Dashboard → Storage
   - Create new bucket: `images`
   - Set bucket to public
   - Add RLS policies for authenticated users

6. **Set up authentication providers (optional)**
   
   For Google OAuth:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

7. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### For Users

1. **Sign Up/Sign In**: Create an account or sign in with email/Google
2. **Upload Ingredients**: Take a photo or upload an image of your ingredients
3. **AI Detection**: Watch as AI identifies your ingredients automatically
4. **Review & Edit**: Confirm detected ingredients and add any missing ones
5. **Generate Recipes**: Get personalized recipe suggestions instantly
6. **Save Favorites**: Heart recipes you love for easy access later
7. **Browse Recipes**: Explore the growing recipe database

### For Developers

The app is built with modern React patterns and includes:
- Server and Client Components
- React Query for data fetching
- Type-safe API routes
- Responsive design patterns
- Error boundaries and loading states

## 🗄 Database Schema

### Core Tables

- **recipes**: Stores recipe information (title, ingredients, steps, etc.)
- **favorites**: User's saved recipes
- **ingredient_queries**: Tracks user photo uploads and detected ingredients
- **auth.users**: Managed by Supabase Auth

### Key Features

- Row Level Security (RLS) enabled
- Automatic timestamps
- Foreign key relationships
- Optimized indexes for performance

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables in Vercel**
   - Add all environment variables from `.env.local`
   - Ensure `OPENAI_API_KEY` is set as a secret

3. **Update Supabase settings**
   - Add your Vercel domain to Supabase Auth → Site URL
   - Update redirect URLs for OAuth providers

### Environment Variables for Production

Ensure these are set in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## 🔐 Security Considerations

- API keys are stored securely on the server
- Row Level Security protects user data
- Image uploads are validated for type and size
- CORS is properly configured for API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Roadmap

### Current Features ✅
- Multi-ingredient photo recognition
- AI-powered recipe generation
- User authentication & profiles
- Recipe favorites & browsing
- Mobile-responsive design

### Future Enhancements 🎯
- Ingredient quantity detection
- Nutritional information
- Voice-based cooking assistant
- Shopping list integration
- Social features (sharing, reviews)
- Smart fridge integration
- Meal planning features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for powerful AI capabilities
- **Supabase** for backend infrastructure
- **Vercel** for deployment platform
- **shadcn/ui** for beautiful UI components
- **Next.js team** for the amazing framework