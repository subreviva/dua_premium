-- Permitir insert em public.users durante signup (apenas próprio user)
CREATE POLICY "Users can insert their own profile during signup"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Permitir insert em duaia_user_balances durante signup
CREATE POLICY "Users can create their own balance"
ON public.duaia_user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir users verem/atualizarem próprio registo
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Permitir users verem próprio balance
CREATE POLICY "Users can view own balance"
ON public.duaia_user_balances
FOR SELECT
USING (auth.uid() = user_id);
