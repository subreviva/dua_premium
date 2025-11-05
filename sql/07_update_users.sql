-- 7. Atualizar usuários existentes
UPDATE users 
SET 
  full_name = COALESCE(full_name, name, 'Usuário'),
  total_tokens = COALESCE(total_tokens, 100),
  tokens_used = COALESCE(tokens_used, 0),
  subscription_tier = COALESCE(subscription_tier, 'free'),
  profile_visibility = COALESCE(profile_visibility, 'public'),
  email_notifications = COALESCE(email_notifications, true),
  push_notifications = COALESCE(push_notifications, true),
  marketing_emails = COALESCE(marketing_emails, false),
  total_projects = COALESCE(total_projects, 0),
  total_generated_content = COALESCE(total_generated_content, 0)
WHERE full_name IS NULL OR total_tokens IS NULL;