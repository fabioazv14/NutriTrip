-- NutriTrip Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User profile / onboarding answers
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  goal TEXT,                    -- 'lose', 'maintain', 'gain'
  diet TEXT,                    -- JSON array: '["vegetarian","keto"]'
  allergies TEXT,               -- JSON array: '["dairy","nuts"]'
  budget TEXT,                  -- daily food budget value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,                   -- auto-generated from first message
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Learned food preferences (extracted from chats by AI)
-- Stored as lightweight tags: "no milk", "likes chicken", "avoid sugar", etc.
CREATE TABLE IF NOT EXISTS food_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  preference_type TEXT NOT NULL CHECK(preference_type IN ('like', 'dislike', 'allergy', 'avoid', 'goal')),
  tag TEXT NOT NULL,
  source TEXT DEFAULT 'chat',   -- 'chat', 'onboarding', 'manual'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, tag, preference_type)
);

-- Meal logs (from MealTracker)
CREATE TABLE IF NOT EXISTS meal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT,                    -- AI-detected meal name
  note TEXT,
  image_path TEXT,
  calories INTEGER DEFAULT 0,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user ON food_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meal_logs(logged_at);
