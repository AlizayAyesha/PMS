-- Site media bucket for CMS uploads (T-601)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
  on storage.objects for select
  using (bucket_id = 'site-media');

drop policy if exists "Authenticated upload site media" on storage.objects;
create policy "Authenticated upload site media"
  on storage.objects for insert
  with check (bucket_id = 'site-media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update site media" on storage.objects;
create policy "Authenticated update site media"
  on storage.objects for update
  using (bucket_id = 'site-media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete site media" on storage.objects;
create policy "Authenticated delete site media"
  on storage.objects for delete
  using (bucket_id = 'site-media' and auth.role() = 'authenticated');
