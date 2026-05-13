import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import { canReceiveNotification } from '../utils/notificationPreferences'
import { lessonQuestionsHandler, questionDetailHandler } from '../endpoints/questionsEndpoints'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const isAdmin = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && req?.user?.role === 'admin'

const toId = (value: unknown): string | number | null => {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id ?? null
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

const getOwnedClassroomIds = async (req?: PayloadRequest | null) => {
  if (!req?.payload || req.user?.collection !== 'users' || !req.user?.id) return []
  if (req.user.role === 'admin') return []

  const classrooms = await req.payload.find({
    collection: 'classrooms',
    depth: 0,
    limit: 500,
    where: {
      professor: {
        equals: req.user.id,
      },
    },
  })

  return (
    classrooms.docs
      ?.map((doc) => toId(doc))
      .filter((id): id is string | number => id != null) ?? []
  )
}

const getStaffQuestionAccess = async (req?: PayloadRequest | null): Promise<boolean | Where> => {
  if (!isStaff(req)) return false
  if (isAdmin(req)) return true
  const classroomIds = await getOwnedClassroomIds(req)
  if (!classroomIds.length) return false
  return {
    classroom: {
      in: classroomIds,
    },
  }
}

export const Questions: CollectionConfig = {
  slug: 'questions',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    group: 'Student Support',
    defaultColumns: ['status', 'classroom', 'lesson', 'user', 'createdAt'],
  },
  // Payload 3 scopes /api/questions/* to this collection's endpoints array.
  endpoints: [
    {
      path: '/by-lesson/:lessonId',
      method: 'get',
      handler: lessonQuestionsHandler,
    },
    {
      path: '/:questionId/detail',
      method: 'get',
      handler: questionDetailHandler,
    },
  ],
  access: {
    read: async ({ req }) => {
      if (isStaff(req)) return getStaffQuestionAccess(req)
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts',
    update: async ({ req }) => {
      if (isStaff(req)) return getStaffQuestionAccess(req)
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    delete: async ({ req }) => getStaffQuestionAccess(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.collection === 'accounts' && req.user?.id) {
          data.user = req.user.id
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson
        const lessonId = toId(lessonValue)

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
            const chapterId = toId(data.chapter)
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

        if (req.user?.collection === 'accounts') {
          data.user = originalDoc?.user ?? data.user
          data.lesson = originalDoc?.lesson ?? data.lesson
          data.chapter = originalDoc?.chapter ?? data.chapter
          data.class = originalDoc?.class ?? data.class
          data.classroom = originalDoc?.classroom ?? data.classroom
          data.answers = originalDoc?.answers ?? []

          const classId = toId(data.class ?? originalDoc?.class)
          const studentId = toId(data.user ?? originalDoc?.user)

          if (!classId || !studentId) {
            throw new Error('Questions must be tied to a classroom membership.')
          }

          const classrooms = await req.payload.find({
            collection: 'classrooms',
            depth: 0,
            limit: 100,
            where: {
              class: { equals: classId },
            },
          })

          const classroomIds =
            classrooms.docs
              ?.map((doc) => toId(doc))
              .filter((id): id is string | number => id != null) ?? []

          if (!classroomIds.length) {
            throw new Error('Join a classroom for this course before asking lesson questions.')
          }

          const memberships = await req.payload.find({
            collection: 'classroom-memberships',
            depth: 1,
            limit: 10,
            sort: '-joinedAt',
            where: {
              student: { equals: studentId },
              classroom: { in: classroomIds },
            },
          })

          const matchingMemberships = memberships.docs ?? []
          if (!matchingMemberships.length) {
            throw new Error('Join a classroom for this course before asking lesson questions.')
          }

          const classroomId = toId(
            (matchingMemberships[0] as { classroom?: unknown }).classroom,
          )

          if (!classroomId) {
            throw new Error('Unable to determine the classroom for this question.')
          }

          data.classroom = classroomId
          data.status = originalDoc ? (data.status === 'resolved' ? 'resolved' : originalDoc.status) : 'open'
        }

        if (Array.isArray(data.answers) && req.user?.collection === 'users') {
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

        const shouldNotify = await canReceiveNotification(req.payload, recipient, 'question_answered')
        if (shouldNotify) {
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
        }

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
      name: 'classroom',
      type: 'relationship',
      relationTo: 'classrooms',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'The classroom membership used when the student asked this question.',
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
