import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04121f] px-4 py-10 sm:px-6">
      <div className="login-animated-bg" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[36px] border border-white/10 bg-white/95 p-8 shadow-[0_40px_120px_rgba(4,18,31,0.45)] backdrop-blur lg:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/80 p-4 shadow-[0_10px_30px_rgba(4,18,31,0.12)]">
              <Image
                src="/logo.svg"
                alt="Company logo"
                width={64}
                height={64}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-neutral-900">Log in</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
