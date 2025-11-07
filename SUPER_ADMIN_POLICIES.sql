
-- Policy para SUPER ADMIN: acesso total a todos os users
DROP POLICY IF EXISTS "Super admins can read all users" ON public.users;

CREATE POLICY "Super admins can read all users"
ON public.users
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE email = 'estraca@2lados.pt'
  )
);

-- Policy para SUPER ADMIN: pode atualizar qualquer user
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;

CREATE POLICY "Super admins can update all users"
ON public.users
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE email = 'estraca@2lados.pt'
  )
);

-- Policy para SUPER ADMIN: pode deletar qualquer user
DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;

CREATE POLICY "Super admins can delete users"
ON public.users
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.users 
    WHERE email = 'estraca@2lados.pt'
  )
);
