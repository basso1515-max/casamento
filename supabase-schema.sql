-- ============================================================
-- Guilherme & Sabrina · Álbum colaborativo do casamento
-- Execute este arquivo uma única vez no Supabase > SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.upload_tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  token_hash text not null unique,
  active boolean not null default true,
  max_uploads integer null check (max_uploads is null or max_uploads > 0),
  uploads_used integer not null default 0 check (uploads_used >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  token_id uuid not null references public.upload_tokens(id) on delete restrict,
  original_name text not null,
  content_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_at timestamptz not null default now()
);

create index if not exists photos_uploaded_at_idx
  on public.photos (uploaded_at desc);

create index if not exists photos_token_id_idx
  on public.photos (token_id);

-- O navegador nunca consulta essas tabelas diretamente.
-- Toda leitura/escrita passa pelas rotas do Next.js usando a Secret Key.
alter table public.upload_tokens enable row level security;
alter table public.photos enable row level security;

revoke all on table public.upload_tokens from anon, authenticated;
revoke all on table public.photos from anon, authenticated;
grant all on table public.upload_tokens to service_role;
grant all on table public.photos to service_role;

-- Registra uma foto e incrementa o contador no mesmo transaction block.
-- Também é idempotente: repetir a confirmação do mesmo storage_path não
-- incrementa o contador duas vezes.
create or replace function public.register_photo_upload(
  p_token_id uuid,
  p_storage_path text,
  p_original_name text,
  p_content_type text,
  p_size_bytes bigint
)
returns public.photos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token public.upload_tokens%rowtype;
  v_photo public.photos%rowtype;
begin
  select * into v_photo
    from public.photos
   where storage_path = p_storage_path
     and token_id = p_token_id;

  if found then
    return v_photo;
  end if;

  select * into v_token
    from public.upload_tokens
   where id = p_token_id
   for update;

  if not found then
    raise exception 'TOKEN_NOT_FOUND';
  end if;

  if not v_token.active then
    raise exception 'TOKEN_INACTIVE';
  end if;

  if v_token.max_uploads is not null
     and v_token.uploads_used >= v_token.max_uploads then
    raise exception 'UPLOAD_LIMIT_REACHED';
  end if;

  insert into public.photos (
    storage_path,
    token_id,
    original_name,
    content_type,
    size_bytes
  ) values (
    p_storage_path,
    p_token_id,
    p_original_name,
    p_content_type,
    p_size_bytes
  )
  returning * into v_photo;

  update public.upload_tokens
     set uploads_used = uploads_used + 1
   where id = p_token_id;

  return v_photo;
end;
$$;

revoke all on function public.register_photo_upload(uuid, text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.register_photo_upload(uuid, text, text, text, bigint) to service_role;

-- Usado apenas pelo painel administrativo.
create or replace function public.delete_photo_record(p_photo_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_photo public.photos%rowtype;
begin
  select * into v_photo
    from public.photos
   where id = p_photo_id
   for update;

  if not found then
    return null;
  end if;

  delete from public.photos where id = p_photo_id;

  update public.upload_tokens
     set uploads_used = greatest(uploads_used - 1, 0)
   where id = v_photo.token_id;

  return v_photo.storage_path;
end;
$$;

revoke all on function public.delete_photo_record(uuid) from public, anon, authenticated;
grant execute on function public.delete_photo_record(uuid) to service_role;

-- Bucket público para leitura das fotos. Uploads continuam autorizados
-- individualmente por signed upload URLs geradas no servidor.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'casamento-fotos',
  'casamento-fotos',
  true,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
