'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to confirm your account.')
        router.push('/login')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred during sign up'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Sign up error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="flex w-full flex-col gap-6">
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
          Full name
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            setError('')
          }}
          required
          disabled={loading}
          className="h-12 rounded-full border-2 border-neutral-200 bg-white/60 px-5 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-900/10"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          required
          disabled={loading}
          className="h-12 rounded-full border-2 border-neutral-200 bg-white/60 px-5 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-900/10"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            required
            minLength={6}
            disabled={loading}
            className="h-12 rounded-full border-2 border-neutral-200 bg-white/60 px-5 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-900/10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-transparent text-neutral-500 hover:bg-black/5 hover:text-neutral-800 focus-visible:ring-neutral-900/10"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-neutral-500">
          Use at least 6 characters to keep your account secure.
        </p>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-full bg-neutral-900 text-base font-medium text-white shadow-[0_18px_35px_rgba(4,18,31,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-black focus-visible:ring-black/20 disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
