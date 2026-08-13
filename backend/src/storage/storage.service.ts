import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import * as path from 'path'
import * as fs from 'fs/promises'
import { createReadStream } from 'fs'

/** Sentinel stored in `Document.s3Bucket` for files kept on the local disk. */
export const LOCAL_BUCKET = 'local'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export interface StoredObject {
  /** Object key (remote) or filesystem path (local) — goes in `Document.s3Key`. */
  key: string
  /** Bucket name, or the `local` sentinel. Goes in `Document.s3Bucket`. */
  bucket: string
}

/**
 * File storage with two interchangeable backends.
 *
 * When S3 credentials are configured (Cloudflare R2, AWS S3, or any
 * S3-compatible service) objects go to that bucket. Otherwise files fall back
 * to the local disk under UPLOAD_DIR, which is what local development and the
 * Docker Compose stack use.
 *
 * This split matters for hosting: free tiers such as Render give the container
 * an ephemeral filesystem, so anything written to local disk is lost on every
 * restart and redeploy. Configure S3_* there and uploads survive.
 *
 * Existing rows keep working either way — each Document records the bucket it
 * was written to, so old local files are still read from disk after the switch.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly client: S3Client | null
  private readonly bucket: string

  constructor() {
    const bucket = process.env.S3_BUCKET
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

    if (bucket && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        // R2 ignores the region but the SDK requires one; 'auto' is R2's value.
        region: process.env.S3_REGION || 'auto',
        // Unset for AWS S3; for R2 this is https://<account-id>.r2.cloudflarestorage.com
        endpoint: process.env.S3_ENDPOINT || undefined,
        credentials: { accessKeyId, secretAccessKey },
        // R2 and most S3-compatible services need path-style addressing.
        forcePathStyle: true,
      })
      this.bucket = bucket
      this.logger.log(`Object storage enabled (bucket: ${bucket})`)
    } else {
      this.client = null
      this.bucket = LOCAL_BUCKET
      this.logger.warn(
        'S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY not set — using local disk. ' +
        'Uploads will not survive a restart on hosts with an ephemeral filesystem.',
      )
    }
  }

  /** True when writes go to object storage rather than the local disk. */
  get isRemote(): boolean {
    return this.client !== null
  }

  /**
   * Persist a file. `keyPrefix` namespaces the object (e.g. the user id, or
   * 'avatars'); `filename` must already be sanitised by the caller.
   */
  async put(
    keyPrefix: string,
    filename: string,
    body: Buffer,
    contentType: string,
  ): Promise<StoredObject> {
    if (!this.client) {
      const destDir = path.join(UPLOAD_DIR, keyPrefix)
      const localPath = path.join(destDir, filename)
      await fs.mkdir(destDir, { recursive: true })
      await fs.writeFile(localPath, body)
      return { key: localPath, bucket: LOCAL_BUCKET }
    }

    const key = `${keyPrefix}/${filename}`
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
    return { key, bucket: this.bucket }
  }

  /**
   * The key + bucket that `put(keyPrefix, filename, …)` would produce right
   * now. For records that store only a filename (avatars) rather than a full
   * key, this reconstructs the location under the active backend.
   */
  resolve(keyPrefix: string, filename: string): StoredObject {
    if (!this.client) {
      return { key: path.join(UPLOAD_DIR, keyPrefix, filename), bucket: LOCAL_BUCKET }
    }
    return { key: `${keyPrefix}/${filename}`, bucket: this.bucket }
  }

  /** Local-disk location for a file, regardless of the active backend. */
  localPathFor(keyPrefix: string, filename: string): string {
    return path.join(UPLOAD_DIR, keyPrefix, filename)
  }

  /**
   * Open a read stream for a stored object. `bucket` comes from the database
   * row, so files written before object storage was enabled still resolve.
   */
  async getStream(key: string, bucket: string): Promise<Readable> {
    if (bucket === LOCAL_BUCKET || !this.client) {
      return createReadStream(key)
    }

    const res = await this.client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    )
    if (!res.Body) throw new NotFoundException('File not found in storage')
    return res.Body as Readable
  }

  /** Best-effort delete; a missing object is not an error worth failing on. */
  async delete(key: string, bucket: string): Promise<void> {
    try {
      if (bucket === LOCAL_BUCKET || !this.client) {
        await fs.unlink(key)
        return
      }
      await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    } catch {
      this.logger.warn(`Could not delete stored file ${bucket}:${key}`)
    }
  }
}
