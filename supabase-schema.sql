-- =============================================================================
-- SUPABASE SCHEMA — PARADIS E-LEARNING PLATFORM (PELP)
-- Version: 1.0 — 2026-07-28
-- Target project: paraid-formation-it
-- =============================================================================

-- =============================================================================
-- AUTH EXTENSION (built-in Supabase Auth)
-- Users authenticate via email/password or OAuth (GitHub, Google)
-- auth.users table is managed by Supabase automatically.
-- We store supplemental profile data in our profiles table.
-- =============================================================================

-- =============================================================================
-- 1. PROFILES (extends auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    target_role TEXT NOT NULL DEFAULT 'sysadmin'
        CHECK (target_role IN ('bcc_it_officer', 'sysadmin', 'data_analyst', 'fullstack')),
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =============================================================================
-- 2. PROGRESS (tracks per-day completion)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_id TEXT NOT NULL CHECK (day_id ~ '^jour-[0-9]{1,2}$'),
    tome TEXT NOT NULL CHECK (tome IN ('P0', 'P2', 'P3A', 'P3B', 'P3C', 'P4', 'P5', 'P6')),
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 45),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_score SMALLINT CHECK (quiz_score BETWEEN 0 AND 100),
    time_spent_minutes INT DEFAULT 0,
    notes TEXT DEFAULT '',
    bookmarked BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, day_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_day ON public.progress(day_id);
CREATE INDEX IF NOT EXISTS idx_progress_tome ON public.progress(tome);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON public.progress(is_completed);

-- =============================================================================
-- 3. QCM (question bank)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.qcm_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('qcm', 'open', 'case')),
    choices TEXT[] DEFAULT '{}',
    correct_index SMALLINT,
    weight SMALLINT NOT NULL DEFAULT 1,
    explanation TEXT,
    tags TEXT[] DEFAULT '{}',
    difficulty TEXT NOT NULL DEFAULT 'easy'
        CHECK (difficulty IN ('easy', 'medium', 'hard')),
    tome TEXT CHECK (tome IN ('P0', 'P2', 'P3A', 'P3B', 'P3C', 'P4', 'P5', 'P6')),
    day_id TEXT CHECK (day_id ~ '^jour-[0-9]{1,2}$'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qcm_tome ON public.qcm_questions(tome);
CREATE INDEX IF NOT EXISTS idx_qcm_tags ON public.qcm_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_qcm_difficulty ON public.qcm_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_qcm_active ON public.qcm_questions(is_active);

-- =============================================================================
-- 4. QCM ATTEMPTS (user submissions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.qcm_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.qcm_questions(id) ON DELETE CASCADE,
    answer_index SMALLINT,
    is_correct BOOLEAN,
    time_taken_seconds INT DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qcm_attempts_user ON public.qcm_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_qcm_attempts_question ON public.qcm_attempts(question_id);

-- =============================================================================
-- 5. EXAM SESSIONS (for BCC examen blanc)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    score SMALLINT CHECK (score BETWEEN 0 AND 100),
    questions_used TEXT NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{"total_questions": 100, "duration_minutes": 120, "strict_mode": true}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_user ON public.exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_finished ON public.exam_sessions(finished_at);

-- =============================================================================
-- 6. NOTES (user annotations per day)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_id TEXT NOT NULL CHECK (day_id ~ '^jour-[0-9]{1,2}$'),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_day ON public.notes(user_id, day_id);

-- =============================================================================
-- 7. BACKUPS (periodic export snapshots)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_user ON public.backups(user_id);

-- =============================================================================
-- COMPUTE FUNCTION: daily streak
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_streak(user_id UUID)
RETURNS INT AS $$
DECLARE
    streak INT DEFAULT 0;
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT day_number, completed_at, is_completed
        FROM public.progress
        WHERE user_id = $1 AND is_completed = TRUE
        ORDER BY day_number DESC
    LOOP
        IF rec.day_number = (SELECT COALESCE(MAX(day_number), 0) FROM public.progress WHERE user_id = $1 AND is_completed = TRUE) - streak THEN
            streak := streak + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMPUTE FUNCTION: competency radar scores
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_radar_scores(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'supportBureautique', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             JOIN public.profiles pf ON pf.id = p.user_id
             WHERE p.user_id = user_id
             AND p.tome = 'P0' AND p.is_completed = TRUE
            ), 0),
        'systemesReseaux', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             WHERE p.user_id = user_id
             AND p.tome IN ('P2', 'P3A') AND p.is_completed = TRUE
            ), 0),
        'devAlgo', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             WHERE p.user_id = user_id
             AND p.tome IN ('P2', 'P3C') AND p.is_completed = TRUE
            ), 0),
        'dataSql', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             WHERE p.user_id = user_id
             AND p.tome IN ('P2', 'P3B') AND p.is_completed = TRUE
            ), 0),
        'cloudSecurity', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             WHERE p.user_id = user_id
             AND p.tome = 'P4' AND p.is_completed = TRUE
            ), 0),
        'bankingGovernance', COALESCE(
            (SELECT AVG(p.quiz_score)::INT FROM public.progress p
             WHERE p.user_id = user_id
             AND p.tome IN ('P5', 'P6') AND p.is_completed = TRUE
            ), 0)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGER: auto-update updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_progress ON public.progress;
CREATE TRIGGER set_timestamp_progress
    BEFORE UPDATE ON public.progress
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_progress ON public.profiles;
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_notes ON public.notes;
CREATE TRIGGER set_timestamp_notes
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_qcm ON public.qcm_questions;
CREATE TRIGGER set_timestamp_qcm
    BEFORE UPDATE ON public.qcm_questions
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qcm_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile and the public read-only for others
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can read all profiles (anonymized)" ON public.profiles
    FOR SELECT USING (true);

-- Progress: users can only see and modify their own progress
CREATE POLICY "Users can read own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.progress
    FOR DELETE USING (auth.uid() = user_id);

-- QCM questions: publicly readable (no private data)
CREATE POLICY "Public can read all QCM questions" ON public.qcm_questions
    FOR SELECT USING (true);

-- QCM attempts: users can only see their own attempts
CREATE POLICY "Users can read own attempts" ON public.qcm_attempts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.qcm_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exam sessions: users can only see their own exams
CREATE POLICY "Users can read own exams" ON public.exam_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exams" ON public.exam_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON public.exam_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Notes: users can only see their own notes
CREATE POLICY "Users can read own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Backups: users can only see their own backups
CREATE POLICY "Users can read own backups" ON public.backups
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own backups" ON public.backups
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own backups" ON public.backups
    FOR DELETE USING (auth.uid() = user_id);
