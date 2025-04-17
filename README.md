# ContentMark

ContentMark is an AI-powered social media content generation platform that helps users create engaging, platform-optimized posts for LinkedIn, Twitter, and Reddit. Built with Next.js, Supabase, and the Vercel AI SDK, ContentMark streamlines the content creation process for social media managers, marketers, and content creators.

## Features

- **User Authentication**: Secure login and registration with email/password, GitHub, and Google OAuth
- **Knowledge Base Setup**: Define your content preferences, topics, tone, and target audience
- **AI-Powered Content Generation**: Generate platform-specific posts optimized for LinkedIn, Twitter, and Reddit
- **Post Management**: Save, edit, and delete your generated posts
- **Responsive Design**: Fully responsive UI that works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **AI**: Vercel AI SDK with OpenAI integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- OpenAI API key

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/habeebmoosa/ContentMark.git
cd ContentMark
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up the database

Run the SQL setup script in your Supabase SQL editor:

```sql
-- Create profiles table (extends Supabase auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topics TEXT[] NOT NULL,
  tone TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'reddit')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
-- Profiles: Users can only read/update their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Knowledge Bases: Users can only CRUD their own knowledge bases
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge bases" 
ON knowledge_bases FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge bases" 
ON knowledge_bases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge bases" 
ON knowledge_bases FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge bases" 
ON knowledge_bases FOR DELETE 
USING (auth.uid() = user_id);

-- Saved Posts: Users can only CRUD their own saved posts
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved posts" 
ON saved_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved posts" 
ON saved_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved posts" 
ON saved_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved posts" 
ON saved_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email/Password, GitHub, and Google providers
3. Configure the redirect URLs for your OAuth providers to point to your application's `/auth/callback` route

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
contentmark/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── auth/               # Auth-related routes
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── dashboard-layout.tsx # Dashboard layout component
│   └── supabase-provider.tsx # Supabase context provider
├── public/                 # Static assets
├── .env.local              # Environment variables (create this)
├── middleware.ts           # Next.js middleware for auth
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── tailwind.config.js      # Tailwind CSS configuration
```

## Usage

1. **Sign up or log in** to your ContentMark account
2. **Set up your knowledge base** with topics, tone, and target audience
3. **Generate posts** by selecting a platform (LinkedIn, Twitter, or Reddit)
4. **Save and manage** your generated posts
5. **Edit or delete** posts as needed

## Deployment

The easiest way to deploy ContentMark is with [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)

---

Built with ❤️ by Habeeb Moosa
