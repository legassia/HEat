-- Migration: Add emoji column to profiles
-- Generates a random emoji on profile creation

-- Add emoji column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emoji TEXT;

-- Function to generate random emoji
CREATE OR REPLACE FUNCTION generate_random_emoji()
RETURNS TEXT AS $$
DECLARE
  emojis TEXT[] := ARRAY[
    '🔥', '⭐', '🌟', '💫', '✨', '🎯', '🚀', '💪', '🎉', '🎊',
    '🍕', '🍔', '🌮', '🥪', '🍟', '🍿', '🥤', '🍩', '🧁', '🎂',
    '🦊', '🐼', '🦁', '🐯', '🐻', '🦋', '🌺', '🌸', '🌼', '🌻',
    '⚡', '💎', '🏆', '🎸', '🎮', '🎨', '📚', '💡', '🌈', '☀️'
  ];
BEGIN
  RETURN emojis[1 + floor(random() * array_length(emojis, 1))::int];
END;
$$ LANGUAGE plpgsql;

-- Trigger function to set default emoji
CREATE OR REPLACE FUNCTION set_default_emoji()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.emoji IS NULL THEN
    NEW.emoji := generate_random_emoji();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS profiles_default_emoji ON profiles;

CREATE TRIGGER profiles_default_emoji
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_default_emoji();

-- Update existing profiles without emoji
UPDATE profiles 
SET emoji = generate_random_emoji() 
WHERE emoji IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.emoji IS 'Random emoji assigned to user as avatar identifier';
