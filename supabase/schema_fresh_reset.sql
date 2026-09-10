-- RuralLearn V1 database setup - FRESH PROJECT RESET + INSTALL
-- Use this file only on a brand-new/empty Supabase project.
-- It removes any partially-created RuralLearn V1 objects from a failed first run, then recreates them.

begin;

-- Clean up a partial previous RuralLearn V1 installation.
drop policy if exists "participants download class notes" on storage.objects;
drop policy if exists "teachers upload class notes" on storage.objects;
drop policy if exists "teachers delete class notes" on storage.objects;
delete from storage.objects where bucket_id = 'notes';
delete from storage.buckets where id = 'notes';

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.get_attempt_review(uuid);
drop function if exists public.submit_quiz(uuid, jsonb);
drop function if exists public.get_quiz_questions(uuid);
drop function if exists public.join_classroom_by_code(text);
drop function if exists public.claim_teacher_role(text);
drop function if exists public.can_access_class(uuid);
drop function if exists public.is_class_member(uuid);
drop function if exists public.is_class_teacher(uuid);
drop function if exists public.is_teacher();
drop function if exists public.handle_new_user();

drop table if exists public.student_answers cascade;
drop table if exists public.quiz_attempts cascade;
drop table if exists public.questions cascade;
drop table if exists public.quizzes cascade;
drop table if exists public.live_sessions cascade;
drop table if exists public.notes cascade;
drop table if exists public.announcements cascade;
drop table if exists public.class_members cascade;
drop table if exists public.classrooms cascade;
drop table if exists public.profiles cascade;

drop schema if exists private cascade;
drop type if exists public.quiz_option cascade;
drop type if exists public.user_role cascade;

create extension if not exists pgcrypto;

create type public.user_role as enum ('teacher', 'student');
create type public.quiz_option as enum ('A', 'B', 'C', 'D');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.app_settings (
  key text primary key,
  value text not null
);

-- Change COLLEGE2026 below before running this file if you want a different teacher code.
insert into private.app_settings(key, value)
values ('teacher_code_hash', encode(digest('COLLEGE2026', 'sha256'), 'hex'))
on conflict (key) do update set value = excluded.value;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  description text not null default '',
  class_code text not null unique,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.class_members (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  file_path text not null,
  file_name text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  room_name text not null unique,
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  duration_minutes integer not null default 15 check (duration_minutes between 1 and 180),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option public.quiz_option not null,
  marks integer not null default 1 check (marks between 1 and 100),
  position integer not null default 0
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  total_marks integer not null default 0,
  submitted_at timestamptz not null default now(),
  unique (quiz_id, student_id)
);

create table public.student_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option public.quiz_option,
  is_correct boolean not null default false,
  marks_awarded integer not null default 0,
  unique (attempt_id, question_id)
);

create index class_members_student_idx on public.class_members(student_id);
create index announcements_class_idx on public.announcements(classroom_id, created_at desc);
create index notes_class_idx on public.notes(classroom_id, created_at desc);
create index quizzes_class_idx on public.quizzes(classroom_id, created_at desc);
create index questions_quiz_idx on public.questions(quiz_id, position);
create index attempts_quiz_idx on public.quiz_attempts(quiz_id, submitted_at desc);

-- New users always start as students. Teacher status can only be claimed through the secure function below.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper authorization functions. SECURITY DEFINER prevents RLS recursion.
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher');
$$;

create or replace function public.is_class_teacher(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.classrooms c
    where c.id = p_classroom_id and c.teacher_id = auth.uid()
  );
$$;

create or replace function public.is_class_member(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.class_members m
    where m.classroom_id = p_classroom_id and m.student_id = auth.uid()
  );
$$;

create or replace function public.can_access_class(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_class_teacher(p_classroom_id) or public.is_class_member(p_classroom_id);
$$;

create or replace function public.claim_teacher_role(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
declare
  expected_hash text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select value into expected_hash from private.app_settings where key = 'teacher_code_hash';
  if expected_hash is null or encode(digest(coalesce(p_code, ''), 'sha256'), 'hex') <> expected_hash then
    raise exception 'Invalid teacher access code';
  end if;

  update public.profiles set role = 'teacher' where id = auth.uid();
  return true;
end;
$$;

grant execute on function public.claim_teacher_role(text) to authenticated;

create or replace function public.join_classroom_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class uuid;
  caller_role public.user_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role is distinct from 'student' then
    raise exception 'Only students can join classrooms';
  end if;

  select id into target_class
  from public.classrooms
  where upper(class_code) = upper(trim(p_code));

  if target_class is null then
    raise exception 'Classroom code not found';
  end if;

  insert into public.class_members(classroom_id, student_id)
  values (target_class, auth.uid())
  on conflict do nothing;

  return target_class;
end;
$$;

grant execute on function public.join_classroom_by_code(text) to authenticated;

-- Students fetch quiz questions without receiving the correct answer.
create or replace function public.get_quiz_questions(p_quiz_id uuid)
returns table (
  id uuid,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  marks integer,
  "position" integer
)
language sql
stable
security definer
set search_path = public
as $$
  select qn.id, qn.question_text, qn.option_a, qn.option_b, qn.option_c, qn.option_d, qn.marks, qn.position
  from public.questions qn
  join public.quizzes q on q.id = qn.quiz_id
  where q.id = p_quiz_id
    and q.published = true
    and public.is_class_member(q.classroom_id)
  order by qn.position, qn.id;
$$;

grant execute on function public.get_quiz_questions(uuid) to authenticated;

create or replace function public.submit_quiz(p_quiz_id uuid, p_answers jsonb)
returns table (attempt_id uuid, score integer, total_marks integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  qrow public.quizzes%rowtype;
  new_attempt uuid;
  qn public.questions%rowtype;
  selected text;
  running_score integer := 0;
  total integer := 0;
begin
  select * into qrow from public.quizzes where id = p_quiz_id and published = true;
  if qrow.id is null then raise exception 'Quiz not found or not published'; end if;
  if not public.is_class_member(qrow.classroom_id) then raise exception 'You are not a member of this classroom'; end if;
  if exists(select 1 from public.quiz_attempts a where a.quiz_id = p_quiz_id and a.student_id = auth.uid()) then
    raise exception 'Quiz already attempted';
  end if;

  select coalesce(sum(marks), 0) into total from public.questions where quiz_id = p_quiz_id;

  insert into public.quiz_attempts(quiz_id, student_id, score, total_marks)
  values (p_quiz_id, auth.uid(), 0, total)
  returning id into new_attempt;

  for qn in select * from public.questions where quiz_id = p_quiz_id order by position, id loop
    selected := upper(nullif(p_answers->>qn.id::text, ''));
    if selected not in ('A','B','C','D') then selected := null; end if;

    insert into public.student_answers(attempt_id, question_id, selected_option, is_correct, marks_awarded)
    values (
      new_attempt,
      qn.id,
      selected::public.quiz_option,
      selected is not null and selected::public.quiz_option = qn.correct_option,
      case when selected is not null and selected::public.quiz_option = qn.correct_option then qn.marks else 0 end
    );

    if selected is not null and selected::public.quiz_option = qn.correct_option then
      running_score := running_score + qn.marks;
    end if;
  end loop;

  update public.quiz_attempts set score = running_score where id = new_attempt;
  return query select new_attempt, running_score, total;
end;
$$;

grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;

create or replace function public.get_attempt_review(p_attempt_id uuid)
returns table (
  question_id uuid,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  selected_option public.quiz_option,
  correct_option public.quiz_option,
  is_correct boolean,
  marks integer,
  marks_awarded integer,
  "position" integer
)
language sql
stable
security definer
set search_path = public
as $$
  select qn.id, qn.question_text, qn.option_a, qn.option_b, qn.option_c, qn.option_d,
         sa.selected_option, qn.correct_option, sa.is_correct, qn.marks, sa.marks_awarded, qn.position
  from public.student_answers sa
  join public.quiz_attempts qa on qa.id = sa.attempt_id
  join public.questions qn on qn.id = sa.question_id
  join public.quizzes q on q.id = qa.quiz_id
  where sa.attempt_id = p_attempt_id
    and (qa.student_id = auth.uid() or public.is_class_teacher(q.classroom_id))
  order by qn.position, qn.id;
$$;

grant execute on function public.get_attempt_review(uuid) to authenticated;

-- Enable RLS everywhere exposed through the Data API.
alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.class_members enable row level security;
alter table public.announcements enable row level security;
alter table public.notes enable row level security;
alter table public.live_sessions enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.student_answers enable row level security;

-- Profiles
create policy "profiles read own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "teacher reads students in own classes" on public.profiles for select to authenticated using (
  exists (
    select 1 from public.class_members m
    join public.classrooms c on c.id = m.classroom_id
    where m.student_id = profiles.id and c.teacher_id = auth.uid()
  )
);
create policy "student reads teachers of joined classes" on public.profiles for select to authenticated using (
  role = 'teacher' and exists (
    select 1 from public.classrooms c
    join public.class_members m on m.classroom_id = c.id
    where c.teacher_id = profiles.id and m.student_id = auth.uid()
  )
);

-- Classrooms
create policy "classrooms readable by participants" on public.classrooms for select to authenticated using (public.can_access_class(id));
create policy "teachers create classrooms" on public.classrooms for insert to authenticated with check (teacher_id = auth.uid() and public.is_teacher());
create policy "teachers update own classrooms" on public.classrooms for update to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teachers delete own classrooms" on public.classrooms for delete to authenticated using (teacher_id = auth.uid());

-- Memberships
create policy "members visible to participants" on public.class_members for select to authenticated using (public.can_access_class(classroom_id));
create policy "students leave classroom" on public.class_members for delete to authenticated using (student_id = auth.uid());

-- Announcements
create policy "announcements readable by participants" on public.announcements for select to authenticated using (public.can_access_class(classroom_id));
create policy "teacher creates announcements" on public.announcements for insert to authenticated with check (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));
create policy "teacher deletes announcements" on public.announcements for delete to authenticated using (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));

-- Notes
create policy "notes readable by participants" on public.notes for select to authenticated using (public.can_access_class(classroom_id));
create policy "teacher creates notes" on public.notes for insert to authenticated with check (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));
create policy "teacher deletes notes" on public.notes for delete to authenticated using (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));

-- Live sessions
create policy "live sessions readable by participants" on public.live_sessions for select to authenticated using (public.can_access_class(classroom_id));
create policy "teacher creates live sessions" on public.live_sessions for insert to authenticated with check (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));
create policy "teacher updates live sessions" on public.live_sessions for update to authenticated using (teacher_id = auth.uid() and public.is_class_teacher(classroom_id)) with check (teacher_id = auth.uid());

-- Quizzes: students only see published quizzes.
create policy "teacher reads own quizzes" on public.quizzes for select to authenticated using (teacher_id = auth.uid());
create policy "students read published class quizzes" on public.quizzes for select to authenticated using (published = true and public.is_class_member(classroom_id));
create policy "teacher creates quizzes" on public.quizzes for insert to authenticated with check (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));
create policy "teacher updates quizzes" on public.quizzes for update to authenticated using (teacher_id = auth.uid() and public.is_class_teacher(classroom_id)) with check (teacher_id = auth.uid());
create policy "teacher deletes quizzes" on public.quizzes for delete to authenticated using (teacher_id = auth.uid() and public.is_class_teacher(classroom_id));

-- Correct answers are not directly readable by students; they use RPCs above.
create policy "teacher reads quiz questions" on public.questions for select to authenticated using (
  exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid())
);
create policy "teacher creates quiz questions" on public.questions for insert to authenticated with check (
  exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid())
);
create policy "teacher updates quiz questions" on public.questions for update to authenticated using (
  exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid())
);
create policy "teacher deletes quiz questions" on public.questions for delete to authenticated using (
  exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid())
);

-- Attempts
create policy "students read own attempts" on public.quiz_attempts for select to authenticated using (student_id = auth.uid());
create policy "teachers read class attempts" on public.quiz_attempts for select to authenticated using (
  exists(select 1 from public.quizzes q where q.id = quiz_id and public.is_class_teacher(q.classroom_id))
);

create policy "students read own answer rows" on public.student_answers for select to authenticated using (
  exists(select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid())
);
create policy "teachers read class answer rows" on public.student_answers for select to authenticated using (
  exists(
    select 1 from public.quiz_attempts a
    join public.quizzes q on q.id = a.quiz_id
    where a.id = attempt_id and public.is_class_teacher(q.classroom_id)
  )
);

-- Grants for authenticated users. RLS still decides which rows they may access.
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.classrooms to authenticated;
grant select, delete on public.class_members to authenticated;
grant select, insert, delete on public.announcements to authenticated;
grant select, insert, delete on public.notes to authenticated;
grant select, insert, update on public.live_sessions to authenticated;
grant select, insert, update, delete on public.quizzes to authenticated;
grant select, insert, update, delete on public.questions to authenticated;
grant select on public.quiz_attempts to authenticated;
grant select on public.student_answers to authenticated;

-- Storage bucket for class notes. Private bucket -> use signed URLs in the app.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'notes',
  'notes',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "participants download class notes"
on storage.objects for select to authenticated
using (
  bucket_id = 'notes'
  and public.can_access_class(((storage.foldername(name))[1])::uuid)
);

create policy "teachers upload class notes"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'notes'
  and public.is_class_teacher(((storage.foldername(name))[1])::uuid)
);

create policy "teachers delete class notes"
on storage.objects for delete to authenticated
using (
  bucket_id = 'notes'
  and public.is_class_teacher(((storage.foldername(name))[1])::uuid)
);

commit;
