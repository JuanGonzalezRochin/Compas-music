-- =====================================================================
-- Compás Music Academy — database setup (step 1: accounts + homework)
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a new project.
-- =====================================================================

-- ---------- Roles ----------
create type public.user_role as enum ('student', 'teacher', 'admin');

-- ---------- Profiles (one per login) ----------
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text,
  full_name     text not null default '',
  phone         text,
  role          public.user_role not null default 'student',
  instrument    text,                 -- student: what they learn · teacher: what they teach
  level         text,
  plan          text,                 -- plan id from the website (e.g. 'complete')
  guardian_name text,                 -- parent/guardian when the student is a minor
  lang          text not null default 'es',
  created_at    timestamptz not null default now()
);

-- ---------- Helper functions (bypass RLS safely) ----------
create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('teacher','admin') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- ---------- New signups become students automatically ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, instrument, level, plan, guardian_name, lang)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'instrument',
    new.raw_user_meta_data->>'level',
    new.raw_user_meta_data->>'plan',
    new.raw_user_meta_data->>'guardian_name',
    coalesce(new.raw_user_meta_data->>'lang', 'es')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Students can't promote themselves or change their plan.
-- (auth.uid() is null in the SQL Editor, so you can always fix things there.)
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role then raise exception 'Only an admin can change roles'; end if;
    if not public.is_staff() and new.plan is distinct from old.plan then raise exception 'Only staff can change plans'; end if;
  end if;
  return new;
end $$;

create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------- Which teacher teaches which student ----------
create table public.teacher_students (
  teacher_id uuid not null references public.profiles on delete cascade,
  student_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, student_id)
);

-- ---------- Private teacher notes about a student ----------
create table public.student_notes (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles on delete cascade,
  teacher_id uuid not null references public.profiles on delete cascade default auth.uid(),
  body       text not null,
  created_at timestamptz not null default now()
);

-- ---------- Classes ----------
create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.profiles on delete cascade default auth.uid(),
  title        text not null default '',
  instrument   text,
  format       text not null default 'private' check (format in ('private','group','trial')),
  starts_at    timestamptz not null,
  duration_min int not null default 60 check (duration_min between 10 and 240),
  room_url     text,                  -- filled automatically in step 2 (Daily)
  status       text not null default 'scheduled' check (status in ('scheduled','done','cancelled')),
  created_at   timestamptz not null default now()
);

create table public.lesson_students (
  lesson_id  uuid not null references public.lessons on delete cascade,
  student_id uuid not null references public.profiles on delete cascade,
  attended   boolean,
  primary key (lesson_id, student_id)
);

-- ---------- Score library ----------
create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles on delete cascade default auth.uid(),
  title      text not null,
  composer   text,
  instrument text,
  kind       text not null default 'pdf' check (kind in ('pdf','gp','musicxml','other')),
  file_path  text not null,           -- path inside the 'scores' storage bucket
  created_at timestamptz not null default now()
);

-- ---------- Homework ----------
create table public.homework (
  id               uuid primary key default gen_random_uuid(),
  teacher_id       uuid not null references public.profiles on delete cascade default auth.uid(),
  student_id       uuid not null references public.profiles on delete cascade,
  lesson_id        uuid references public.lessons on delete set null,
  score_id         uuid references public.scores on delete set null,
  title            text not null,
  instructions     text,
  target_bpm       int check (target_bpm between 20 and 300),
  due_date         date,
  status           text not null default 'assigned' check (status in ('assigned','done','reviewed')),
  teacher_feedback text,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- Students may only mark their homework done / not done.
create or replace function public.guard_homework_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if (new.teacher_id, new.student_id, new.lesson_id, new.score_id, new.title, new.instructions,
        new.target_bpm, new.due_date, new.teacher_feedback)
       is distinct from
       (old.teacher_id, old.student_id, old.lesson_id, old.score_id, old.title, old.instructions,
        old.target_bpm, old.due_date, old.teacher_feedback)
    then raise exception 'Students can only mark homework as done'; end if;
    if new.status not in ('assigned','done') then raise exception 'Invalid status'; end if;
  end if;
  return new;
end $$;

create trigger guard_homework_update before update on public.homework
  for each row execute function public.guard_homework_update();

-- ---------- Practice log ----------
create table public.practice_logs (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles on delete cascade default auth.uid(),
  homework_id uuid references public.homework on delete set null,
  minutes     int not null check (minutes between 1 and 600),
  bpm_reached int check (bpm_reached between 20 and 300),
  note        text,
  file_path   text,                   -- optional audio/video in the 'practice' bucket
  created_at  timestamptz not null default now()
);

-- ---------- Useful indexes ----------
create index on public.homework (student_id, status);
create index on public.homework (teacher_id);
create index on public.lessons (teacher_id, starts_at);
create index on public.lesson_students (student_id);
create index on public.practice_logs (student_id, created_at desc);

-- Lesson helpers (security definer = no policy loops between lessons and lesson_students)
create or replace function public.is_lesson_student(p_lesson uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lesson_students where lesson_id = p_lesson and student_id = auth.uid())
$$;
create or replace function public.is_lesson_teacher(p_lesson uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lessons where id = p_lesson and teacher_id = auth.uid())
$$;

-- =====================================================================
-- Row Level Security: who can see and change what
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.teacher_students enable row level security;
alter table public.student_notes    enable row level security;
alter table public.lessons          enable row level security;
alter table public.lesson_students  enable row level security;
alter table public.scores           enable row level security;
alter table public.homework         enable row level security;
alter table public.practice_logs    enable row level security;

-- profiles: you see yourself; everyone logged in sees teachers; staff see everyone
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or role in ('teacher','admin') or public.is_staff());
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- teacher_students
create policy "ts_select" on public.teacher_students for select to authenticated
  using (teacher_id = auth.uid() or student_id = auth.uid() or public.is_admin());
create policy "ts_insert" on public.teacher_students for insert to authenticated
  with check ((teacher_id = auth.uid() and public.is_staff()) or public.is_admin());
create policy "ts_delete" on public.teacher_students for delete to authenticated
  using ((teacher_id = auth.uid() and public.is_staff()) or public.is_admin());

-- student_notes: staff only
create policy "notes_all" on public.student_notes for all to authenticated
  using (public.is_staff() and (teacher_id = auth.uid() or public.is_admin()))
  with check (public.is_staff() and teacher_id = auth.uid());

-- lessons
create policy "lessons_select" on public.lessons for select to authenticated
  using (teacher_id = auth.uid() or public.is_admin() or public.is_lesson_student(lessons.id));
create policy "lessons_write" on public.lessons for all to authenticated
  using ((teacher_id = auth.uid() and public.is_staff()) or public.is_admin())
  with check ((teacher_id = auth.uid() and public.is_staff()) or public.is_admin());

-- lesson_students
create policy "ls_select" on public.lesson_students for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.is_lesson_teacher(lesson_students.lesson_id));
create policy "ls_write" on public.lesson_students for all to authenticated
  using (public.is_admin() or public.is_lesson_teacher(lesson_students.lesson_id))
  with check (public.is_admin() or public.is_lesson_teacher(lesson_students.lesson_id));

-- scores: staff see all; students see scores attached to their homework
create policy "scores_select" on public.scores for select to authenticated
  using (public.is_staff()
         or exists (select 1 from public.homework h where h.score_id = scores.id and h.student_id = auth.uid()));
create policy "scores_write" on public.scores for all to authenticated
  using ((owner_id = auth.uid() and public.is_staff()) or public.is_admin())
  with check (owner_id = auth.uid() and public.is_staff());

-- homework
create policy "hw_select" on public.homework for select to authenticated
  using (student_id = auth.uid() or teacher_id = auth.uid() or public.is_admin());
create policy "hw_insert" on public.homework for insert to authenticated
  with check (public.is_staff() and teacher_id = auth.uid());
create policy "hw_update" on public.homework for update to authenticated
  using (student_id = auth.uid() or teacher_id = auth.uid() or public.is_admin());
create policy "hw_delete" on public.homework for delete to authenticated
  using (teacher_id = auth.uid() or public.is_admin());

-- practice_logs
create policy "pl_select" on public.practice_logs for select to authenticated
  using (student_id = auth.uid() or public.is_admin()
         or exists (select 1 from public.teacher_students ts where ts.student_id = practice_logs.student_id and ts.teacher_id = auth.uid()));
create policy "pl_insert" on public.practice_logs for insert to authenticated
  with check (student_id = auth.uid());
create policy "pl_delete" on public.practice_logs for delete to authenticated
  using (student_id = auth.uid());

-- =====================================================================
-- File storage
--   scores   : teachers upload sheet music
--   practice : students upload practice recordings (folder = their user id)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('scores', 'scores', false, 20971520),      -- 20 MB per file
       ('practice', 'practice', false, 52428800)   -- 50 MB per file
on conflict (id) do nothing;

create policy "scores_files_staff" on storage.objects for all to authenticated
  using (bucket_id = 'scores' and public.is_staff())
  with check (bucket_id = 'scores' and public.is_staff());
create policy "scores_files_students" on storage.objects for select to authenticated
  using (bucket_id = 'scores' and exists (
    select 1 from public.homework h join public.scores s on s.id = h.score_id
    where h.student_id = auth.uid() and s.file_path = storage.objects.name));

create policy "practice_files_own" on storage.objects for all to authenticated
  using (bucket_id = 'practice' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'practice' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "practice_files_staff" on storage.objects for select to authenticated
  using (bucket_id = 'practice' and public.is_staff());
