
-- Change default free credits to 10
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 10;

-- Codeit projects table
CREATE TABLE public.codeit_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  entry TEXT NOT NULL DEFAULT '/App.jsx',
  template TEXT NOT NULL DEFAULT 'react',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

ALTER TABLE public.codeit_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own codeit projects"
  ON public.codeit_projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view codeit projects (for /creations links)"
  ON public.codeit_projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_codeit_projects_updated_at
  BEFORE UPDATE ON public.codeit_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_codeit_user ON public.codeit_projects(user_id);
CREATE INDEX idx_codeit_slug ON public.codeit_projects(user_id, slug);
