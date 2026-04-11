import { NextRequest } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: true })
  }

  try {
    const { jobId } = await request.json()
    if (!jobId) {
      return Response.json({ error: 'jobId required' }, { status: 400 })
    }

    await db
      .update(schema.generationJobs)
      .set({ playCount: sql`${schema.generationJobs.playCount} + 1` })
      .where(eq(schema.generationJobs.id, jobId))

    return Response.json({ ok: true })
  } catch {
    // Non-blocking — don't fail if tracking fails
    return Response.json({ ok: true })
  }
}
