create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default '',
    email text not null unique,
    target_role text not null default 'sysadmin'
        check (target_role in ('bcc_it_officer', 'sysadmin', 'data_analyst', 'fullstack')),
    avatar_url text default '',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_profiles_email on public.profiles(email);

create table if not exists public.progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    day_id text not null check (day_id ~ '^jour-[0-9]{1,2}$'),
    tome text not null check (tome in ('P0', 'P2', 'P3A', 'P3B', 'P3C', 'P4', 'P5', 'P6')),
    day_number int not null check (day_number between 1 and 45),
    is_completed boolean not null default false,
    quiz_score smallint check (quiz_score between 0 and 100),
    time_spent_minutes int default 0,
    notes text default '',
    bookmarked boolean default false,
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, day_id)
);

create index if not exists idx_progress_user on public.progress(user_id);
create index if not exists idx_progress_day on public.progress(day_id);
create index if not exists idx_progress_tome on public.progress(tome);
create index if not exists idx_progress_completed on public.progress(is_completed);

create table if not exists public.qcm_questions (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    type text not null check (type in ('qcm', 'open', 'case')),
    choices text[] default '{}',
    correct_index smallint,
    weight smallint not null default 1,
    explanation text,
    tags text[] default '{}',
    difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
    tome text check (tome in ('P0', 'P2', 'P3A', 'P3B', 'P3C', 'P4', 'P5', 'P6')),
    day_id text check (day_id ~ '^jour-[0-9]{1,2}$'),
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_qcm_tome on public.qcm_questions(tome);
create index if not exists idx_qcm_tags on public.qcm_questions using gin(tags);
create index if not exists idx_qcm_difficulty on public.qcm_questions(difficulty);
create index if not exists idx_qcm_active on public.qcm_questions(is_active);

create table if not exists public.qcm_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    question_id uuid not null references public.qcm_questions(id) on delete cascade,
    answer_index smallint,
    is_correct boolean,
    time_taken_seconds int default 0,
    attempted_at timestamptz default now()
);

create index if not exists idx_qcm_attempts_user on public.qcm_attempts(user_id);
create index if not exists idx_qcm_attempts_question on public.qcm_attempts(question_id);

create table if not exists public.exam_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    score smallint check (score between 0 and 100),
    questions_used text not null default '[]',
    settings jsonb default '{"total_questions": 100, "duration_minutes": 120, "strict_mode": true}',
    created_at timestamptz default now()
);

create index if not exists idx_exam_user on public.exam_sessions(user_id);
create index if not exists idx_exam_finished on public.exam_sessions(finished_at);

create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    day_id text not null check (day_id ~ '^jour-[0-9]{1,2}$'),
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_notes_user_day on public.notes(user_id, day_id);

create table if not exists public.backups (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    snapshot jsonb not null,
    file_name text not null,
    created_at timestamptz default now()
);

create index if not exists idx_backup_user on public.backups(user_id);

create or replace function public.get_streak(user_id uuid)
returns int as $$
declare
    streak int default 0;
    rec record;
    max_day int;
    current_day int;
begin
    select coalesce(max(day_number), 0) into max_day
    from public.progress
    where user_id = $1 and is_completed = true;

    if max_day = 0 then
        return 0;
    end if;

    for rec in
        select day_number
        from public.progress
        where user_id = $1 and is_completed = true
        order by day_number desc
    loop
        current_day := rec.day_number;
        if current_day = max_day - streak then
            streak := streak + 1;
        else
            exit;
        end if;
    end loop;

    return streak;
end;
$$ language plpgsql security definer;

create or replace function public.get_radar_scores(user_id uuid)
returns jsonb as $$
declare
    result jsonb;
begin
    select jsonb_build_object(
        'supportBureautique', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome = 'P0' and p.is_completed = true), 0),
        'systemesReseaux', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome in ('P2', 'P3A') and p.is_completed = true), 0),
        'devAlgo', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome in ('P2', 'P3C') and p.is_completed = true), 0),
        'dataSql', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome in ('P2', 'P3B') and p.is_completed = true), 0),
        'cloudSecurity', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome = 'P4' and p.is_completed = true), 0),
        'bankingGovernance', coalesce(
            (select avg(p.quiz_score)::int from public.progress p
             where p.user_id = user_id and p.tome in ('P5', 'P6') and p.is_completed = true), 0)
    ) into result;
    return result;
end;
$$ language plpgsql security definer;

create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_progress on public.progress;
create trigger set_timestamp_progress
    before update on public.progress
    for each row execute function public.trigger_set_timestamp();

drop trigger if exists set_timestamp_profiles on public.profiles;
create trigger set_timestamp_profiles
    before update on public.profiles
    for each row execute function public.trigger_set_timestamp();

drop trigger if exists set_timestamp_notes on public.notes;
create trigger set_timestamp_notes
    before update on public.notes
    for each row execute function public.trigger_set_timestamp();

drop trigger if exists set_timestamp_qcm on public.qcm_questions;
create trigger set_timestamp_qcm
    before update on public.qcm_questions
    for each row execute function public.trigger_set_timestamp();

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.qcm_attempts enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.backups enable row level security;

create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);
create policy "Public can read all profiles (anonymized)" on public.profiles
    for select using (true);

create policy "Users can read own progress" on public.progress
    for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.progress
    for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.progress
    for update using (auth.uid() = user_id);
create policy "Users can delete own progress" on public.progress
    for delete using (auth.uid() = user_id);

create policy "Public can read all QCM questions" on public.qcm_questions
    for select using (true);

create policy "Users can read own attempts" on public.qcm_attempts
    for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on public.qcm_attempts
    for insert with check (auth.uid() = user_id);

create policy "Users can read own exams" on public.exam_sessions
    for select using (auth.uid() = user_id);
create policy "Users can insert own exams" on public.exam_sessions
    for insert with check (auth.uid() = user_id);
create policy "Users can update own exams" on public.exam_sessions
    for update using (auth.uid() = user_id);

create policy "Users can read own notes" on public.notes
    for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on public.notes
    for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on public.notes
    for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on public.notes
    for delete using (auth.uid() = user_id);

create policy "Users can read own backups" on public.backups
    for select using (auth.uid() = user_id);
create policy "Users can insert own backups" on public.backups
    for insert with check (auth.uid() = user_id);
create policy "Users can delete own backups" on public.backups
    for delete using (auth.uid() = user_id);
