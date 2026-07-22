'use client'

import React, { createContext, useContext } from 'react'

export type UserRole = 'admin' | 'edit'

type AuthContextType = {
  role: UserRole | null
  email: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  email: null,
  loading: true,
})

export function AdminAuthProvider({
  children,
  initialRole,
  initialEmail,
}: {
  children: React.ReactNode
  initialRole: UserRole
  initialEmail: string
}) {
  return (
    <AuthContext.Provider value={{ role: initialRole, email: initialEmail, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AuthContext)
}
