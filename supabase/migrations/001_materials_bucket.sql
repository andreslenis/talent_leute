-- Create materials storage bucket and RLS policies
-- Run this in your Supabase SQL editor

-- 1. Create the materials bucket (public)
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- 2. Allow public read access to published materials
create policy "Public read access for materials"
on storage.objects
for select
using ( bucket_id = 'materials' );

-- 3. Allow authenticated users with trainer/admin role to upload materials
create policy "Trainer and admin can upload materials"
on storage.objects
for insert
with check (
  bucket_id = 'materials'
  and auth.uid() is not null
  and (
    select role from profiles where id = auth.uid()
  ) in ('trainer', 'admin')
);

-- 4. Allow trainers/admins to update/delete their own uploads
create policy "Trainer and admin can update materials"
on storage.objects
for update
using (
  bucket_id = 'materials'
  and auth.uid() is not null
  and (
    select role from profiles where id = auth.uid()
  ) in ('trainer', 'admin')
);

create policy "Trainer and admin can delete materials"
on storage.objects
for delete
using (
  bucket_id = 'materials'
  and auth.uid() is not null
  and (
    select role from profiles where id = auth.uid()
  ) in ('trainer', 'admin')
);
