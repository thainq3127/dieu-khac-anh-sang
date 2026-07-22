import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadObject } from '@/lib/s3'

function sanitizeObjectKey(input: string) {
  const key = input.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!key || key.split('/').some((segment) => segment === '..')) {
    throw new Error('Invalid upload path')
  }
  return key.startsWith('uploads/') ? key : `uploads/${key}`
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const requestedPath = String(formData.get('path') ?? '')

  if (!(file instanceof File) || !requestedPath) {
    return new NextResponse('Invalid upload file', { status: 400 })
  }

  try {
    const key = sanitizeObjectKey(requestedPath)
    await uploadObject({
      key,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    })

    return NextResponse.json({ path: key, key })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    const status = message === 'Invalid upload path' ? 400 : 500
    return new NextResponse(message, { status })
  }
}
