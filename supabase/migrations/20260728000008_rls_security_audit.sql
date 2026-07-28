-- Migration Sprint 08 — Audit RLS & Vues à Moindre Privilège
-- Description: Blindage de la sécurité Row Level Security (RLS) et création de la vue publique des profils sans email.

-- 1. Activation stricte du RLS sur toutes les tables
alter table if exists public.profiles enable row level security;
alter table if exists public.progress enable row level security;
alter table if exists public.notes enable row level security;
alter table if exists public.qcm_questions enable row level security;
alter table if exists public.qcm_attempts enable row level security;
alter table if exists public.exam_sessions enable row level security;

-- 2. Vue publique à moindre privilège (profils sans exposition de l'email)
create or replace view public.public_profiles as
select
    id,
    display_name,
    avatar_url,
    target_role,
    updated_at
from public.profiles;

-- Droits de lecture sur la vue publique
grant select on public.public_profiles to anon, authenticated;

-- 3. Politiques RLS strictes sur public.profiles
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
    on public.profiles for select
    using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- 4. Politiques RLS sur public.progress
drop policy if exists "Progress viewable by owner" on public.progress;
create policy "Progress viewable by owner"
    on public.progress for select
    using (auth.uid() = user_id);

drop policy if exists "Progress insertable by owner" on public.progress;
create policy "Progress insertable by owner"
    on public.progress for insert
    with check (auth.uid() = user_id);

drop policy if exists "Progress updatable by owner" on public.progress;
create policy "Progress updatable by owner"
    on public.progress for update
    using (auth.uid() = user_id);

-- 5. Politiques RLS sur public.qcm_questions (Lecture publique des questions actives)
drop policy if exists "QCM questions viewable by all active" on public.qcm_questions;
create policy "QCM questions viewable by all active"
    on public.qcm_questions for select
    using (is_active = true);
