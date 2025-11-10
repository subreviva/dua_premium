-- Migration: Add chat_images_generated column to users table
-- Tracks free images used per user for chat image generation offer
-- Offer: 2 free images, then 1 credit each

-- Add column to track chat image generations
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS chat_images_generated INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN users.chat_images_generated IS 'Number of images generated in chat (2 free, then 1 credit each)';
