-- Script para verificar e corrigir permissões de admin
-- Execute este SQL no Supabase Dashboard

-- 1. Primeiro, vamos ver todos os usuários na tabela profiles
SELECT id, username, full_name, role, created_at 
FROM profiles 
ORDER BY created_at;

-- 2. Se você souber seu username, substitua 'SEU_USERNAME' abaixo:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE username = 'SEU_USERNAME';

-- 3. Ou se você souber seu email, use este comando:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'seu_email@dominio.com'
-- );

-- 4. Para ver usuários da tabela auth (mostra emails):
SELECT u.id, u.email, u.created_at as auth_created,
       p.username, p.role, p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at;