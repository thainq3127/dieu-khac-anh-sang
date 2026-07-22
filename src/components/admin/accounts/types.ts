export type Profile = {
  id: string
  email: string
  role: 'admin' | 'edit'
  display_name: string | null
  raw_password?: string | null
  created_at: string
}

export type ActivityLog = {
  id: string
  user_id: string | null
  user_email: string
  action: string // 'INSERT', 'UPDATE', 'DELETE'
  target_table: string
  target_id: string | null
  target_name: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}
