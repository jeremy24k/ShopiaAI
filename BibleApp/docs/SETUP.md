# 🔧 Setup Guide - ShopiaAI Bible App

Complete guide for setting up the development environment and configuring external services.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Supabase Configuration](#supabase-configuration)
- [DeepSeek AI Setup](#deepseek-ai-setup)
- [PayPal Integration](#paypal-integration)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **pnpm**
- **Git** ([Download](https://git-scm.com/))
- Code editor (VS Code recommended)

### Required Accounts

- **Supabase** account ([Sign up](https://supabase.com/))
- **DeepSeek** account ([Sign up](https://platform.deepseek.com/))
- **PayPal Developer** account ([Sign up](https://developer.paypal.com/))

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shopiaai-bible-app.git
cd shopiaai-bible-app/BibleApp
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials (see sections below).

Start the backend:
```bash
npm run dev
```

Backend should be running at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd Frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials.

Start the frontend:
```bash
npm run dev
```

Frontend should be running at `http://localhost:5173`

---

## 🗄️ Supabase Configuration

### Step 1: Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - **Name**: ShopiaAI Bible App
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project"

### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 3: Configure Environment Variables

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Backend `.env`:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### Step 4: Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Credits Table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'FREE',
  total_paid_credits_purchased INTEGER DEFAULT 0,
  last_daily_credit DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credit Transactions Table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'completed',
  conversation_id UUID,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  mode_id TEXT DEFAULT 'personal_guide',
  doctrine_id TEXT DEFAULT 'evangelical',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversation Messages Table
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  verse_context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notes Table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_data JSONB NOT NULL,
  content_delta JSONB,
  content_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reading Progress Table
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  translation TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  reading_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
```

### Step 5: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- User Credits Policies
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Credit Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Conversation Messages Policies
CREATE POLICY "Users can view messages from their conversations"
  ON conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their conversations"
  ON conversation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Notes Policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Reading Progress Policies
CREATE POLICY "Users can view their own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 6: Create Database Functions

```sql
-- Function to grant daily credits
CREATE OR REPLACE FUNCTION grant_daily_credits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_credits_granted INTEGER := 10;
  v_current_credits INTEGER;
  v_last_daily_credit DATE;
  v_new_balance INTEGER;
BEGIN
  -- Get current credits and last daily credit date
  SELECT credits, last_daily_credit
  INTO v_current_credits, v_last_daily_credit
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if credits were already granted today
  IF v_last_daily_credit = CURRENT_DATE THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Daily credits already claimed today',
      'next_available', (CURRENT_DATE + INTERVAL '1 day')::TEXT
    );
  END IF;

  -- Grant credits
  v_new_balance := COALESCE(v_current_credits, 0) + v_credits_granted;

  -- Update or insert user credits
  INSERT INTO user_credits (user_id, credits, last_daily_credit, updated_at)
  VALUES (p_user_id, v_new_balance, CURRENT_DATE, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits = v_new_balance,
    last_daily_credit = CURRENT_DATE,
    updated_at = NOW();

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, v_credits_granted, 'daily_grant', 'Daily free credits', 'completed');

  RETURN json_build_object(
    'success', true,
    'credits_granted', v_credits_granted,
    'new_balance', v_new_balance,
    'message', 'Daily credits granted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_action_type TEXT,
  p_conversation_id UUID DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL,
  p_cost_usd DECIMAL DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_credits', COALESCE(v_current_credits, 0),
      'required_credits', p_amount
    );
  END IF;

  -- Deduct credits
  v_new_balance := v_current_credits - p_amount;

  UPDATE user_credits
  SET credits = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, amount, type, description, conversation_id, tokens_used, cost_usd, status
  )
  VALUES (
    p_user_id, -p_amount, 'usage', p_action_type, p_conversation_id, p_tokens_used, p_cost_usd, 'completed'
  );

  RETURN json_build_object(
    'success', true,
    'credits_deducted', p_amount,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 7: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL** to `http://localhost:5173` (development)

---

## 🤖 DeepSeek AI Setup

### Step 1: Create Account

1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Verify your email

### Step 2: Get API Key

1. Go to **API Keys** section
2. Click **Create API Key**
3. Copy the API key (you won't see it again!)

### Step 3: Configure Environment

**Backend `.env`:**
```env
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

### Step 4: Test Connection

```bash
# Start backend
cd Backend
npm run dev

# In another terminal, test the endpoint
curl http://localhost:5000/api/ai/test
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "DeepSeek connection successful",
    "model": "deepseek-chat"
  }
}
```

---

## 💳 PayPal Integration

### Step 1: Create Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Go to **Dashboard**

### Step 2: Create Sandbox App

1. Click **Apps & Credentials**
2. Select **Sandbox** tab
3. Click **Create App**
4. Enter app name: "ShopiaAI Bible App"
5. Click **Create App**

### Step 3: Get Credentials

Copy the following from your app:
- **Client ID**
- **Secret**

### Step 4: Configure Environment

**Frontend `.env`:**
```env
VITE_PAYPAL_CLIENT_ID=your-sandbox-client-id
```

**Backend `.env`:**
```env
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_MODE=sandbox
```

### Step 5: Create Test Accounts

1. Go to **Sandbox** → **Accounts**
2. You'll see default test accounts:
   - **Business** account (merchant)
   - **Personal** account (buyer)
3. Use these for testing payments

### Step 6: Test Payment Flow

1. Start the app
2. Go to AI section
3. Try to send a message (will prompt for credits)
4. Click "Buy Credits"
5. Use sandbox personal account to complete payment
6. Verify credits are added

### Production Setup

When ready for production:

1. Switch to **Live** tab in PayPal Dashboard
2. Create a new app or use existing
3. Get **Live** credentials
4. Update `.env` files:
```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

#### Frontend can't connect to backend

**Error:** `Network Error` or `CORS Error`

**Solution:**
1. Verify backend is running on correct port
2. Check `VITE_API_URL` in frontend `.env`
3. Verify CORS is enabled in backend
4. Check `FRONTEND_URL` in backend `.env`

#### Supabase connection fails

**Error:** `Invalid API key` or `Project not found`

**Solution:**
1. Verify credentials in `.env` files
2. Check if Supabase project is active
3. Regenerate API keys if needed
4. Ensure no extra spaces in `.env` values

#### DeepSeek API errors

**Error:** `Invalid API key` or `Rate limit exceeded`

**Solution:**
1. Verify API key is correct
2. Check DeepSeek account balance/credits
3. Verify API key has proper permissions
4. Check rate limits on your plan

#### PayPal sandbox issues

**Error:** `Payment failed` or `Invalid credentials`

**Solution:**
1. Verify using **sandbox** credentials
2. Check `PAYPAL_MODE=sandbox`
3. Use sandbox test accounts
4. Clear browser cache/cookies
5. Check PayPal Developer Dashboard for errors

#### Database RLS errors

**Error:** `Row level security policy violation`

**Solution:**
1. Verify RLS policies are created
2. Check user is authenticated
3. Verify `user_id` matches `auth.uid()`
4. Review policy conditions

### Getting Help

If you're still stuck:

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Review [API Documentation](docs/API.md)
3. Join community discussions
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots (if applicable)

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Node.js v18+ installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Supabase project created
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] DeepSeek API key working
- [ ] PayPal sandbox configured
- [ ] Test user can register/login
- [ ] Test payment flow works

---

## 🚀 Next Steps

Once setup is complete:

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines
2. Review [API.md](API.md) for endpoint documentation
3. Start developing!

Happy coding! 🎉
