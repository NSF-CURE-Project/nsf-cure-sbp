import Image from 'next/image'

export default function AdminIcon() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src="/assets/logos/sbp_admin_transparent.png"
        alt="NSF CURE SBP"
        width={26}
        height={26}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
