'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'
import { getAdminSettings, setAdminSettings } from '@/lib/admin-actions'

type Settings = {
  site_title: { vi: string; en: string }
  site_description: { vi: string; en: string }
  contact_email: string
  social_links: { facebook: string; youtube: string; instagram: string }
  enabled_languages: string[]
  show_blog: boolean
}

const DEFAULTS: Settings = {
  site_title: { vi: 'Văn Hóa Chăm', en: 'Cham Culture' },
  site_description: { vi: '', en: '' },
  contact_email: '',
  social_links: { facebook: '', youtube: '', instagram: '' },
  enabled_languages: ['vi', 'en', 'ru', 'zh'],
  show_blog: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const map = await getAdminSettings()
      if (map) {
        setSettings({
          site_title: map.site_title as Settings['site_title'] ?? DEFAULTS.site_title,
          site_description: map.site_description as Settings['site_description'] ?? DEFAULTS.site_description,
          contact_email: map.contact_email as string ?? '',
          social_links: map.social_links as Settings['social_links'] ?? DEFAULTS.social_links,
          enabled_languages: map.enabled_languages as string[] ?? DEFAULTS.enabled_languages,
          show_blog: map.show_blog !== undefined ? Boolean(map.show_blog) : true,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await setAdminSettings(settings)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
      setSaving(false)
      return
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  function setNested(key: keyof Settings, sub: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: { ...(prev[key] as object), [sub]: value } }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt website</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chung và liên kết mạng xã hội
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Đã lưu thay đổi thành công.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tên website</CardTitle>
            <CardDescription>Hiển thị ở thẻ title và SEO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tiếng Việt</Label>
                <Input
                  value={settings.site_title.vi}
                  onChange={(e) => setNested('site_title', 'vi', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>English</Label>
                <Input
                  value={settings.site_title.en}
                  onChange={(e) => setNested('site_title', 'en', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mô tả website</CardTitle>
            <CardDescription>Dùng cho SEO meta description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tiếng Việt</Label>
              <Textarea
                value={settings.site_description.vi}
                onChange={(e) => setNested('site_description', 'vi', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>English</Label>
              <Textarea
                value={settings.site_description.en}
                onChange={(e) => setNested('site_description', 'en', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liên hệ & Mạng xã hội</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email liên hệ</Label>
              <Input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings((p) => ({ ...p, contact_email: e.target.value }))}
                placeholder="contact@vanhoacham.vn"
              />
            </div>
            <Separator />
            {(['facebook', 'youtube', 'instagram'] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label className="capitalize">{key}</Label>
                <Input
                  value={settings.social_links[key]}
                  onChange={(e) => setNested('social_links', key, e.target.value)}
                  placeholder={`https://${key}.com/...`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ngôn ngữ hiển thị</CardTitle>
            <CardDescription>Chọn ngôn ngữ xuất hiện trên thanh chuyển ngôn ngữ ngoài trang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isVi = lang.code === 'vi'
              const checked = settings.enabled_languages.includes(lang.code)
              return (
                <div key={lang.code} className="flex items-center gap-3">
                  <Switch
                    checked={checked}
                    disabled={isVi}
                    onCheckedChange={(val) => {
                      if (isVi) return
                      setSettings((prev) => ({
                        ...prev,
                        enabled_languages: val
                          ? [...prev.enabled_languages, lang.code]
                          : prev.enabled_languages.filter((c) => c !== lang.code),
                      }))
                    }}
                  />
                  <Label className={isVi ? 'text-muted-foreground' : ''}>
                    {lang.name}
                    {isVi && <span className="ml-1.5 text-xs">(mặc định, luôn hiển thị)</span>}
                  </Label>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiển thị trang Blog</CardTitle>
            <CardDescription>Bật/tắt trang bài viết trên website công khai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.show_blog}
                onCheckedChange={(val) => setSettings((p) => ({ ...p, show_blog: val }))}
              />
              <Label>{settings.show_blog ? 'Đang hiển thị' : 'Đang ẩn'}</Label>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Lưu cài đặt
        </Button>
      </form>
    </div>
  )
}
