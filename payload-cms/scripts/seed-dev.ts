import type { Payload } from 'payload'

// Minimal seed for fresh dev installs. Creates:
//   1 admin user (so you can log in immediately)
//   1 course / class
//   1 chapter inside that course
//   1 lesson inside that chapter (with a single rich-text block)
//   the standard Pages (delegates to seed-pages.ts)
// Re-running is safe — every step checks for an existing record first.
//
// Run with:
//   pnpm payload run scripts/seed-dev.ts
// Override the seeded admin credentials with env vars:
//   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='changeme!' \
//     pnpm payload run scripts/seed-dev.ts

import seedPages from './seed-pages'

const DEFAULT_EMAIL = 'admin@sbp.local'
const DEFAULT_PASSWORD = 'changeme123!'

type Maybe<T> = T | null | undefined

const findFirst = async <T,>(
  payload: Payload,
  collection: 'users' | 'classes' | 'chapters' | 'lessons',
  where: Record<string, unknown>,
): Promise<Maybe<T>> => {
  const res = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
  })
  return (res.docs[0] as T) ?? null
}

const richTextParagraph = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [
          {
            mode: 'normal',
            text,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      },
    ],
  },
})

export default async function seedDev(payload: Payload) {
  payload.logger.info('--- seed-dev: starting ---')

  // 1. Admin user
  const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD
  let admin = await findFirst<{ id: string | number; role: string }>(payload, 'users', {
    email: { equals: email },
  })
  if (!admin) {
    admin = (await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        firstName: 'Seed',
        lastName: 'Admin',
        role: 'admin',
      },
    })) as { id: string | number; role: string }
    payload.logger.info(`Created admin user: ${email} / ${password}`)
  } else {
    payload.logger.info(`Admin user already exists: ${email}`)
  }

  // 2. Course (class)
  const courseTitle = 'Statics Fundamentals'
  let course = await findFirst<{ id: string | number; slug?: string }>(payload, 'classes', {
    title: { equals: courseTitle },
  })
  if (!course) {
    course = (await payload.create({
      collection: 'classes',
      data: {
        title: courseTitle,
        description: 'A starter course seeded for local development.',
        // slug + order are auto-populated by the Classes beforeValidate hook.
      },
    })) as { id: string | number; slug?: string }
    payload.logger.info(`Created course: ${courseTitle}`)
  } else {
    payload.logger.info(`Course already exists: ${courseTitle}`)
  }

  // 3. Chapter
  const chapterTitle = 'Force Vectors'
  let chapter = await findFirst<{ id: string | number }>(payload, 'chapters', {
    and: [
      { title: { equals: chapterTitle } },
      { class: { equals: course.id } },
    ],
  })
  if (!chapter) {
    chapter = (await payload.create({
      collection: 'chapters',
      data: {
        title: chapterTitle,
        chapterNumber: 1,
        class: course.id,
      },
    })) as { id: string | number }
    payload.logger.info(`Created chapter: ${chapterTitle}`)
  } else {
    payload.logger.info(`Chapter already exists: ${chapterTitle}`)
  }

  // 4. Lesson with a single rich-text block
  const lessonTitle = 'Welcome to Statics'
  let lesson = await findFirst<{ id: string | number }>(payload, 'lessons', {
    and: [
      { title: { equals: lessonTitle } },
      { chapter: { equals: chapter.id } },
    ],
  })
  if (!lesson) {
    lesson = (await payload.create({
      collection: 'lessons',
      data: {
        title: lessonTitle,
        chapter: chapter.id,
        order: 1,
        layout: [
          {
            blockType: 'richTextBlock',
            body: richTextParagraph(
              'This is your first seeded lesson. Edit it in the lesson editor or replace this block to start authoring real content.',
            ),
          },
        ],
        _status: 'published',
      },
    })) as { id: string | number }
    payload.logger.info(`Created lesson: ${lessonTitle}`)
  } else {
    payload.logger.info(`Lesson already exists: ${lessonTitle}`)
  }

  // 5. Pages (delegates to existing script)
  await seedPages(payload)

  payload.logger.info('--- seed-dev: done ---')
  payload.logger.info(`Sign in at /admin with: ${email} / ${password}`)
}
