'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, AlertCircle, Play, Pause, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadMediaFile } from '@/lib/upload-client'

interface AudioUploaderProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export default function AudioUploader({ value, onChange, placeholder, className, id }: AudioUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Clean up audio element when component unmounts or value changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
        setPlaying(false)
      }
    }
  }, [value])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      setError('Vui lòng chỉ tải lên tệp âm thanh (định dạng .mp3).')
      return
    }

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

      const publicUrl = await uploadMediaFile(filePath, file)

      onChange(publicUrl)
    } catch (err: unknown) {
      console.error('Audio upload error:', err)
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải tệp âm thanh lên.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const togglePreview = () => {
    if (!value) return

    if (!audioRef.current) {
      const audio = new Audio(value)
      audio.onended = () => setPlaying(false)
      audioRef.current = audio
    }

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch((err) => {
          console.error('Failed to play preview:', err)
          setError('Không thể phát bản xem trước âm thanh này.')
        })
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlaying(false)
    onChange('')
  }

  return (
    <div className={className} id={id}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="audio/mpeg,audio/mp3,audio/*"
        className="hidden"
      />
      
      {value ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 border border-border rounded-lg bg-muted/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={togglePreview}
              className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/20 transition-colors"
              title={playing ? "Tạm dừng" : "Nghe thử"}
            >
              {playing ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 fill-amber-500 text-amber-500 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{value.split('/').pop() || value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Sẵn sàng sử dụng</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0 justify-end mt-2 sm:mt-0">
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
              onClick={handleClear}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 py-1 px-2.5"
            >
              <Trash2 className="w-3 h-3 mr-1" />
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
              Đang tải âm thanh lên...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-500" />
              {placeholder || 'Bấm để chọn và tải lên tệp MP3'}
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
