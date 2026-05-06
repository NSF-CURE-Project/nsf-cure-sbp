import { redirect } from 'next/navigation'

// Payload mounts the admin UI at /admin; the bare admin host has no
// landing page, so route '/' to the admin login.
export default function RootRedirectPage() {
  redirect('/admin')
}
