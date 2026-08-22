import dynamic from 'next/dynamic'

const enableClerk = Boolean(
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')
)

// 动态安全加载 Clerk 按钮组
const ClerkLoadedButtons = dynamic(
  () =>
    import('@clerk/nextjs').then(m => {
      const { SignInButton, SignedOut, SignedIn, UserButton } = m
      return function ClerkButtons({ locale, signInClass, buttonStyle }) {
        return (
          <>
            <SignedOut>
              <SignInButton mode='modal'>
                <button
                  style={buttonStyle}
                  className={signInClass || 'bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-2 text-sm'}
                >
                  {locale?.COMMON?.SIGN_IN || '登录'}
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </>
        )
      }
    }),
  { ssr: false }
)

export default function ClerkAuthButtons(props) {
  if (!enableClerk) return null
  return <ClerkLoadedButtons {...props} />
}

// 动态安全加载 SignIn 页面组件
export const SafeSignIn = dynamic(
  () =>
    import('@clerk/nextjs').then(m => {
      const { SignIn } = m
      return function DynamicSignIn(props) {
        return <SignIn {...props} />
      }
    }),
  { ssr: false }
)

// 动态安全加载 SignUp 页面组件
export const SafeSignUp = dynamic(
  () =>
    import('@clerk/nextjs').then(m => {
      const { SignUp } = m
      return function DynamicSignUp(props) {
        return <SignUp {...props} />
      }
    }),
  { ssr: false }
)
