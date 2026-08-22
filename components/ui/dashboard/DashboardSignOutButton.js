import dynamic from 'next/dynamic'

const ClerkSignOutButton = dynamic(
  () => import('@clerk/nextjs').then(m => m.SignOutButton),
  { ssr: false }
)

/**
 * 控制台登出按钮
 * @returns
 */
export default function DashboardSignOutButton() {
  const enableClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')
  )
  if (!enableClerk) {
    return null
  }
  return (
    <ClerkSignOutButton redirectUrl='/'>
      <button className='text-white bg-gray-800 hover:bg-gray-900 hover:ring-4 hover:ring-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'>
        <span className='text-nowrap'>
          <i className='fas fa-right-from-bracket' /> Sign Out
        </span>
      </button>
    </ClerkSignOutButton>
  )
}
