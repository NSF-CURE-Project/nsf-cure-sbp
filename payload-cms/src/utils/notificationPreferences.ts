import type { Payload } from 'payload'

export type NotificationPreferenceType =
  | 'question_answered'
  | 'new_content'
  | 'announcement'
  | 'quiz_deadline'

const preferenceFieldByType: Record<NotificationPreferenceType, string> = {
  question_answered: 'questionAnswered',
  new_content: 'newContent',
  announcement: 'announcement',
  quiz_deadline: 'quizDeadline',
}

export const canReceiveNotification = async (
  payload: Payload,
  recipientId: string | number,
  type: NotificationPreferenceType,
) => {
  const account = (await payload.findByID({
    collection: 'accounts',
    id: recipientId,
    depth: 0,
    overrideAccess: true,
  })) as {
    notificationPreferences?: Record<string, boolean | undefined>
  }

  const field = preferenceFieldByType[type]
  const value = account.notificationPreferences?.[field]

  return value ?? true
}
