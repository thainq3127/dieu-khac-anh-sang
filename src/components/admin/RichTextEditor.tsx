'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent, type Editor, Node } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { Extension } from '@tiptap/react'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import {
  Bold, Italic, List, ListOrdered,
  Link2, Undo2, Redo2, ImagePlus, Loader2, Tv
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadMediaFile } from '@/lib/upload-client'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType
      unsetFontFamily: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

export const Iframe = Node.create({
  name: 'iframe',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'rich-text-iframe',
      },
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: '0',
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: element => element.hasAttribute('allowfullscreen'),
        renderHTML: attributes => {
          if (attributes.allowfullscreen) {
            return {
              allowfullscreen: 'true',
            }
          }
          return {}
        },
      },
      width: {
        default: '100%',
      },
      height: {
        default: '450px',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', HTMLAttributes]
  },
})

/**
 * Upload a File (image) to the local media endpoint and return the public URL.
 * Follows the same pattern used by ImageUploader component.
 */
async function uploadImageTostorage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'png'
  const cleanName = (file.name || 'pasted-image')
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\-_]/g, '-')

  const fileName = `${cleanName}-${Date.now()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  return uploadMediaFile(filePath, file)
}

/**
 * Custom Tiptap extension that intercepts paste / drop of images,
 * uploads them, and inserts the resulting public URL.
 */
function createImageUploadExtension(
  onUploadStart: () => void,
  onUploadEnd: () => void,
) {
  return Extension.create({
    name: 'imageUpload',

    addProseMirrorPlugins() {
      const uploadAndInsert = async (files: File[], editor: Editor) => {
        onUploadStart()
        try {
          for (const file of files) {
            if (!file.type.startsWith('image/')) continue
            const url = await uploadImageTostorage(file)
            editor.chain().focus().setImage({ src: url, alt: file.name }).run()
          }
        } catch (err) {
          console.error('Image upload error:', err)
        } finally {
          onUploadEnd()
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const ext = this

      return [
        new Plugin({
          key: new PluginKey('imageUpload'),
          props: {
            handlePaste(_view, event) {
              const items = event.clipboardData?.items
              if (!items) return false

              const imageFiles: File[] = []
              for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item.type.startsWith('image/')) {
                  const file = item.getAsFile()
                  if (file) imageFiles.push(file)
                }
              }

              if (imageFiles.length > 0) {
                event.preventDefault()
                uploadAndInsert(imageFiles, ext.editor)
                return true
              }
              return false
            },

            handleDrop(_view, event) {
              const files = event.dataTransfer?.files
              if (!files || files.length === 0) return false

              const imageFiles: File[] = []
              for (let i = 0; i < files.length; i++) {
                if (files[i].type.startsWith('image/')) {
                  imageFiles.push(files[i])
                }
              }

              if (imageFiles.length > 0) {
                event.preventDefault()
                uploadAndInsert(imageFiles, ext.editor)
                return true
              }
              return false
            },
          },
        }),
      ]
    },
  })
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onUploadStart = useCallback(() => setUploading(true), [])
  const onUploadEnd = useCallback(() => setUploading(false), [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-terra underline' },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rich-text-image',
        },
      }),
      createImageUploadExtension(onUploadStart, onUploadEnd),
      TextStyle,
      FontFamily,
      FontSize,
      Iframe,
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'rich-text-content w-full min-h-[350px] p-4 outline-none focus:ring-0',
        'data-placeholder': placeholder ?? '',
      },
    },
    immediatelyRender: false,
  })

  const prevValueRef = useRef(value)

  // Sync external value changes into editor (e.g. language switch or external update)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value
      if (editor) {
        const current = editor.getHTML()
        if (current !== value) {
          editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
        }
      }
    }
  }, [value, editor])

  const insertLink = () => {
    if (!editor) return
    const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://')
    if (!url) return
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const insertIframe = () => {
    if (!editor) return
    const url = prompt('Nhập địa chỉ iframe (URL):', 'https://')
    if (!url) return
    editor.chain().focus().insertContent({
      type: 'iframe',
      attrs: { src: url }
    }).run()
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !editor) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const url = await uploadImageTostorage(file)
        editor.chain().focus().setImage({ src: url, alt: file.name }).run()
      }
    } catch (err) {
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const isActive = (type: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(type, attrs) ?? false

  const btnClass = (active: boolean) =>
    `w-8 h-8 ${active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background flex flex-col focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 transition-all">
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/20 px-3 py-2 border-b border-input">
        {/* Undo / Redo */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(false)}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(false)}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Bold / Italic */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('bold'))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('italic'))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Heading / Paragraph Selector */}
        <select
          value={
            isActive('heading', { level: 1 }) ? 'h1' :
            isActive('heading', { level: 2 }) ? 'h2' :
            isActive('heading', { level: 3 }) ? 'h3' :
            isActive('heading', { level: 4 }) ? 'h4' :
            isActive('heading', { level: 5 }) ? 'h5' :
            isActive('heading', { level: 6 }) ? 'h6' :
            isActive('paragraph') ? 'p' :
            'default'
          }
          onChange={(e) => {
            if (!editor) return
            const val = e.target.value
            if (val === 'p') {
              editor.chain().focus().setParagraph().run()
            } else if (val.startsWith('h')) {
              const level = parseInt(val.charAt(1), 10) as 1 | 2 | 3 | 4 | 5 | 6
              editor.chain().focus().toggleHeading({ level }).run()
            }
          }}
          className="bg-background border border-input rounded-md px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-7 w-28"
        >
          <option value="p">Đoạn văn (P)</option>
          <option value="h1">Tiêu đề 1 (H1)</option>
          <option value="h2">Tiêu đề 2 (H2)</option>
          <option value="h3">Tiêu đề 3 (H3)</option>
          <option value="h4">Tiêu đề 4 (H4)</option>
          <option value="h5">Tiêu đề 5 (H5)</option>
          <option value="h6">Tiêu đề 6 (H6)</option>
        </select>

        <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Font Family Selector */}
        <select
          value={
            editor?.getAttributes('textStyle')?.fontFamily === 'Inter' ? 'Inter' :
            editor?.getAttributes('textStyle')?.fontFamily === '"Brygada 1918"' ? 'Brygada' :
            editor?.getAttributes('textStyle')?.fontFamily === 'monospace' ? 'Monospace' :
            'default'
          }
          onChange={(e) => {
            if (!editor) return
            const val = e.target.value
            if (val === 'default') {
              editor.chain().focus().unsetFontFamily().run()
            } else if (val === 'Brygada') {
              editor.chain().focus().setFontFamily('"Brygada 1918"').run()
            } else {
              editor.chain().focus().setFontFamily(val).run()
            }
          }}
          className="bg-background border border-input rounded-md px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-7 w-28"
        >
          <option value="default">Phông chữ</option>
          <option value="Brygada">Brygada 1918</option>
          <option value="Inter">Inter</option>
          <option value="Monospace">Monospace</option>
        </select>

        {/* Font Size Selector */}
        <select
          value={editor?.getAttributes('textStyle')?.fontSize || 'default'}
          onChange={(e) => {
            if (!editor) return
            const val = e.target.value
            if (val === 'default') {
              editor.chain().focus().unsetFontSize().run()
            } else {
              editor.chain().focus().setFontSize(val).run()
            }
          }}
          className="bg-background border border-input rounded-md px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-7 w-20"
        >
          <option value="default">Cỡ chữ</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
          <option value="36px">36px</option>
        </select>

        <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Lists */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('bulletList'))}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Danh sách dấu chấm"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('orderedList'))}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Danh sách số"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        {/* Link */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('link'))}
          onClick={insertLink}
          title="Thêm liên kết"
        >
          <Link2 className="w-4 h-4" />
        </Button>

        {/* Iframe */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(isActive('iframe'))}
          onClick={insertIframe}
          title="Nhúng Iframe (Bản đồ, Video...)"
        >
          <Tv className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

        {/* Image Upload Button */}
        <Button
          type="button" variant="ghost" size="icon"
          className={btnClass(false)}
          onClick={handleImageButtonClick}
          disabled={uploading}
          title="Chèn ảnh (Tải lên storage)"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </Button>

        {uploading && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin animate-duration-1000" />
            Đang tải ảnh...
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
