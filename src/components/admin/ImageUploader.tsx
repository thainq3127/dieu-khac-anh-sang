'use client'

import React, { useState, useRef } from 'react'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadMediaFile } from '@/lib/upload-client'
import { resolveAssetUrl } from '@/lib/assets'
import Image from 'next/image'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export default function ImageUploader({ value, onChange, placeholder, className, id }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "") // remove extension
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9-_]/g, '-') // clean special characters
      
      const fileName = `${cleanName}-${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const storagePath = await uploadMediaFile(filePath, file)

      onChange(storagePath)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải ảnh lên.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className} id={id}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      {value ? (
        <div className="flex items-center gap-3 p-2.5 border border-input rounded-lg bg-muted/10">
          <div className="relative w-12 h-12 rounded overflow-hidden border bg-muted shrink-0">
            <Image
              src={resolveAssetUrl(value)}
              alt="Uploaded thumbnail"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground truncate font-mono">{value.split('/').pop() || value}</p>
            <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Đã tải lên</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={triggerFileInput}
              className="h-8 text-xs py-1 px-2.5 font-medium border border-border"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
              Thay đổi
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange('')}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 py-1 px-2.5"
            >
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={triggerFileInput}
          className="w-full h-10 border border-dashed border-input gap-1.5 bg-background hover:bg-muted/40 hover:border-amber-500/40 text-muted-foreground hover:text-foreground justify-center text-xs transition-all font-medium rounded-lg"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Đang tải ảnh lên...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-500" />
              {placeholder || 'Bấm để chọn tệp tải ảnh lên'}
            </>
          )}
        </Button>
      )}

      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
