## Staff Roles — NSF CURE SBP

Role definitions
- `admin` — Full access: manage users, site settings, migrations, and all content.
- `professor` — Can create and edit classes, chapters, lessons, quizzes, and review student progress.
- `staff` — Content editors: can create and update pages and most content but not manage users or settings.

Where enforced
- Roles are enforced in `payload-cms/src/collections/*` via `access` functions. See `Users.ts` for examples.

Granting roles
- Only `admin` users can assign roles. Use the `Users` collection in the admin to change a user's `role` field.

If you need a custom role or finer-grained permissions, we can add additional access checks or a feature flag to support it.

