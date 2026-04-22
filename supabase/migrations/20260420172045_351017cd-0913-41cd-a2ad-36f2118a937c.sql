-- Storage bucket for chat file/image uploads and image studio outputs
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload to their own folder
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('user-uploads', 'generated-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view uploads"
ON storage.objects FOR SELECT
USING (bucket_id IN ('user-uploads', 'generated-images'));

CREATE POLICY "Users delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('user-uploads', 'generated-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Track generated images
CREATE TABLE public.generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  image_url text NOT NULL,
  mode text NOT NULL DEFAULT 'generate',
  source_urls text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own images"
ON public.generated_images FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all images"
ON public.generated_images FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Track deep search reports
CREATE TABLE public.research_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  report jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own reports"
ON public.research_reports FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Track minecraft projects
CREATE TABLE public.minecraft_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  platform text NOT NULL,
  mc_version text NOT NULL,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.minecraft_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own mc projects"
ON public.minecraft_projects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);