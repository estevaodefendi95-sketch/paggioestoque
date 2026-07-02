
DROP POLICY IF EXISTS shared_state_select ON public.estoque_state;
DROP POLICY IF EXISTS shared_state_insert ON public.estoque_state;
DROP POLICY IF EXISTS shared_state_update ON public.estoque_state;

CREATE POLICY "paggio_admin_select" ON public.estoque_state
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = 'paggio.adm@gmail.com');

CREATE POLICY "paggio_admin_insert" ON public.estoque_state
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'paggio.adm@gmail.com');

CREATE POLICY "paggio_admin_update" ON public.estoque_state
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'paggio.adm@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'paggio.adm@gmail.com');
