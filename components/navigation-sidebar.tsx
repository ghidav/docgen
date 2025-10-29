'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Home, Bell, Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NavigationSidebar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserEmail(user.email ?? null)

        // Fetch profile data including avatar_url
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else if (profile) {
          console.log('Profile loaded:', profile)
          console.log('Avatar URL:', profile.avatar_url)
          setAvatarUrl(profile.avatar_url)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        toast.error('Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('An error occurred during logout')
      console.error('Logout error:', error)
    }
  }

  const getInitials = () => {
    if (!userEmail) return 'U'
    return userEmail.charAt(0).toUpperCase()
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-16 border-r bg-background flex flex-col items-center justify-start py-4">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          title="Logo"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          title="Home"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom Navigation Icons */}
      <div className="mt-auto flex flex-col items-center justify-center gap-4 w-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Avatar with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
              {!isLoading && (
                <Avatar className="h-10 w-10">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={userEmail || 'User'} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-64">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Account</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
