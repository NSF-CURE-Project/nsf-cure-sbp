import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' || ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const Questions: CollectionConfig = {
  slug: 'questions',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    group: 'Student Support',
    defaultColumns: ['status', 'lesson', 'user', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts' || isStaff(req),
    update: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.id) {
          data.user = req.user.id
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson
        const lessonId =
          typeof lessonValue === 'object' && lessonValue !== null
            ? (lessonValue as { id?: string }).id
            : lessonValue

        if (lessonId) {
          const lesson = await req.payload.findByID({
            collection: 'lessons',
            id: lessonId,
            depth: 0,
          })
          if (lesson) {
            data.lesson = lesson.id
            data.chapter =
              (lesson as { chapter?: string | { id?: string } }).chapter ?? data.chapter
            const chapterId =
              typeof data.chapter === 'object' && data.chapter !== null
                ? (data.chapter as { id?: string }).id
                : data.chapter
            if (chapterId) {
              const chapter = await req.payload.findByID({
                collection: 'chapters',
                id: chapterId,
                depth: 0,
              })
              if (chapter) {
                data.chapter = chapter.id
                data.class = (chapter as { class?: string | { id?: string } }).class ?? data.class
              }
            }
          }
        }

        if (Array.isArray(data.answers)) {
          const now = new Date().toISOString()
          const staffAuthor = req.user?.collection === 'users' ? req.user.id : undefined
          data.answers = data.answers.map((answer) => ({
            createdAt: answer.createdAt ?? now,
            author: answer.author ?? staffAuthor,
            ...answer,
          }))
        }

        if (Array.isArray(data.answers) && data.answers.length > 0) {
          if (data.status !== 'resolved') {
            data.status = 'answered'
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (!req?.payload || !doc) return doc

        const previousAnswers = Array.isArray(previousDoc?.answers) ? previousDoc.answers.length : 0
        const nextAnswers = Array.isArray(doc.answers) ? doc.answers.length : 0
        const hasNewAnswer = nextAnswers > previousAnswers
        const becameAnswered = doc.status === 'answered' && previousDoc?.status !== 'answered'

        if (!hasNewAnswer && !becameAnswered) return doc
        if (doc.status !== 'answered') return doc

        const recipient =
          typeof doc.user === 'object' && doc.user !== null
            ? (doc.user as { id?: string }).id
            : doc.user
        if (!recipient) return doc

        const title = 'Your question has a new answer'
        const body = doc.title
          ? `"${doc.title}" has been answered by staff.`
          : 'A staff member responded to your question.'

        await req.payload.create({
          collection: 'notifications',
          data: {
            recipient,
            title,
            body,
            question: doc.id,
            type: 'question_answered',
          },
          overrideAccess: true,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      admin: {
        description: 'Question is scoped to this lesson.',
      },
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'class',
      type: 'relationship',
      relationTo: 'classes',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Answered', value: 'answered' },
        { label: 'Resolved', value: 'resolved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Use Markdown or simple text. Math with $...$ is supported on the frontend.',
      },
    },
    {
      name: 'attachment',
      label: 'Optional image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'answers',
      type: 'array',
      label: 'Answers',
      admin: {
        description: 'Staff and TAs can respond here.',
      },
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'body',
          type: 'richText',
          required: true,
        },
        {
          name: 'createdAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
  ],
}
