import dynamic from 'next/dynamic'

const ClerkUserProfile = dynamic(
  () => import('@clerk/nextjs').then(m => m.UserProfile),
  { ssr: false }
)

/**
 * 控制台用户账号面板
 * @returns
 */
export default function DashboardUser() {
  const enableClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')
  )
  if (!enableClerk) {
    return null
  }
  return (
    <ClerkUserProfile
      appearance={{
        elements: {
          cardBox: 'w-full',
          rootBox: 'w-full'
        }
      }}
      className='bg-blue-300'
      routing='path'
      path='/dashboard/user-profile'
    />
  )
}
