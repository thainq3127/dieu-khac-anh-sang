import 'server-only'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.S3_ENDPOINT
const region = process.env.S3_REGION || 'us-east-1'
const bucket = process.env.S3_BUCKET
const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

function requireS3Env() {
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing S3 upload env configuration')
  }
}

export function getS3Client() {
  requireS3Env()
  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  })
}

export async function uploadObject(input: {
  key: string
  body: Buffer
  contentType?: string
}) {
  requireS3Env()

  await getS3Client().send(new PutObjectCommand({
    Bucket: bucket!,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
  }))

  return input.key
}
