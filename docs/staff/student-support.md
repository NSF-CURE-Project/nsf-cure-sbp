## Student Support — NSF CURE SBP

This guide covers the day-to-day support surfaces for learners. For the full admin tour see [`payload-admin-handbook.md`](./payload-admin-handbook.md).

## Where to look

| Concern | Collection / page |
| --- | --- |
| Account exists / locked out / password reset | `Accounts` (`/admin/collections/accounts`) — learner auth. Staff accounts live in `Users`. |
| Progress questions | `LessonProgress`, `QuizAttempts`, `ProblemAttempts` |
| Open student questions on lessons | `Questions` (`/admin/collections/questions?where[status][equals]=open`) |
| Platform feedback (free-form) | `Feedback` (`/admin/collections/feedback?where[read][equals]=false`) |
| Per-lesson feedback | `LessonFeedback`, or the panel inside the lesson scaffold editor |
| Learner inbox / notifications | `Notifications` (`/admin/collections/notifications`) |
| Bookmarks | `LessonBookmarks` |
| Classroom enrollment | `Classrooms`, `ClassroomMemberships` |

## Questions & Answers

Learners post questions on a lesson; staff respond.

1. Open `/admin/collections/questions?where[status][equals]=open` to see waiting items.
2. Open the question, add a reply in the `Answers` array.
3. Set the `status`:
   - `open` — still waiting on staff.
   - `answered` — staff responded.
   - `resolved` — issue closed.
4. When a question is moved to `answered` and the answer is published, a `Notification` is created for the recipient automatically (subject to their `notificationPreferences`).

## Lesson feedback

- Learners submit per-lesson feedback that appears in `LessonFeedback`.
- Staff can reply in the collection list view, or use the `Lesson Feedback` panel inside the lesson scaffold editor for in-context review.

## Notifications

- The `Notifications` collection is the learner inbox.
- Notifications are created automatically by hooks (e.g., new answer to a question). Staff can also create one-off notifications manually.
- `accounts` records carry `notificationPreferences`; the system checks these before sending an email/push and skips delivery when the recipient has opted out.

## Common support flows

- **Reset password**: trigger a password reset for the learner from the `Accounts` collection's `Send reset email` control, or ask the learner to use the `/forgot-password` flow on the public web app.
- **Re-enroll**: re-issue a classroom join code (sidebar control on the classroom record) and have the learner re-join. For exceptional cases, admins can edit `ClassroomMemberships` directly.
- **Override progress**: admins can edit `LessonProgress` records directly when correcting bugs or accommodating make-ups.
- **Logout all sessions**: `/api/accounts/logout-all` is available for security incidents. The learner will need to re-authenticate everywhere.

## Roster-level views

When a learner reports a broad problem (lots of failed attempts, can't access a chapter), use:

- `/admin/student-performance` — roster-level progress and quiz performance with filters.
- `/admin/user-analytics` — per-instructor / per-classroom drilldown.
- `/admin/quiz-stats/[quizId]` and `/admin/question-stats/[questionId]` — drill into specific assessment items.

## When to escalate

- Suspected production infrastructure issue (DB outages, email delivery failures, S3 errors, RPPR export failures): escalate to the repo owner and ops lead.
- Compliance / PII concerns: see [`docs/staff/safety.md`](./safety.md).
- Bulk roster operations or migrations: open a request with the engineering owner — bypassing collection access rules at scale should go through engineering.
