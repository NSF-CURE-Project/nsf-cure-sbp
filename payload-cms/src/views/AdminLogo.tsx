import Image from 'next/image'

export default function AdminLogo() {
  return (
    <div className="admin-login-logo">
      <Image
        src="/assets/logos/sbp_admin_transparent.png"
        alt="NSF CURE SBP"
        width={320}
        height={320}
        style={{ width: 'min(320px, 70vw)', height: 'auto' }}
      />
    </div>
  )
}
