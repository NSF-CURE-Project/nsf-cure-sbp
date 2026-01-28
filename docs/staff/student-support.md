## Student Support — NSF CURE SBP

How to help students
- For account issues (login, password reset), use the admin `Users` collection to confirm account existence and reset as needed.
- For progress questions, consult `LessonProgress` and `QuizAttempts` in the admin to see timestamps and completion state.

Common support flows
- Reset password: Trigger password reset via the admin or ask the student to use the `forgot-password` flow on the web app.
- Re-enroll or override progress: Admins may edit `LessonProgress` records directly in exceptional cases.

When to escalate
- If issues appear to be caused by production infrastructure (DB outages, email delivery failures), escalate to the repo owner and ops lead.