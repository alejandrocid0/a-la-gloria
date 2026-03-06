
-- 1. Add image_url column to tournaments
ALTER TABLE public.tournaments ADD COLUMN image_url TEXT;

-- 2. Create public storage bucket for tournament images
INSERT INTO storage.buckets (id, name, public) VALUES ('tournament-images', 'tournament-images', true);

-- 3. RLS: Admins can upload/delete tournament images
CREATE POLICY "Admins can upload tournament images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tournament-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tournament images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tournament-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tournament images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tournament-images' AND public.has_role(auth.uid(), 'admin'));

-- 4. Anyone can view tournament images (public bucket)
CREATE POLICY "Public can view tournament images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tournament-images');
