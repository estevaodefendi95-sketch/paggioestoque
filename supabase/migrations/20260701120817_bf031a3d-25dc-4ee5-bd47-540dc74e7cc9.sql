
CREATE TABLE public.estoque_state (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque_state TO authenticated;
GRANT ALL ON public.estoque_state TO service_role;

ALTER TABLE public.estoque_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_state_select" ON public.estoque_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_state_insert" ON public.estoque_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_state_update" ON public.estoque_state FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
