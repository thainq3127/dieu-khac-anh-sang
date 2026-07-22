'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    signIn('credentials', {
      email,
      password,
      redirectTo: '/admin',
    }).catch((err) => {
      console.error('Admin login failed:', err)
      setError('Không thể đăng nhập. Vui lòng thử lại.')
      setLoading(false)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl text-gold leading-none select-none">✦</div>
          <h1 className="text-xl font-semibold tracking-tight">Văn Hóa Chăm</h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Admin CMS</p>
        </div>

        <Card>
          <CardHeader className="pb-4" />
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
