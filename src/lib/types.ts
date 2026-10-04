export type UserRole = 'teacher' | 'student'
export type QuizOption = 'A' | 'B' | 'C' | 'D'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Classroom {
  id: string
  name: string
  subject: string
  description: string
  class_code: string
  teacher_id: string
  created_at: string
}

export interface Announcement {
  id: string
  classroom_id: string
  teacher_id: string
  message: string
  created_at: string
}

export interface Note {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  description: string
  file_path: string
  file_name: string
  mime_type: string | null
  created_at: string
}

export interface LiveSession {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  room_name: string
  active: boolean
  started_at: string
  ended_at: string | null
}

export interface Quiz {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  description: string
  duration_minutes: number
  published: boolean
  created_at: string
}

export interface Question {
  id: string
  quiz_id?: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option?: QuizOption
  marks: number
  position: number
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  score: number
  total_marks: number
  submitted_at: string
}
