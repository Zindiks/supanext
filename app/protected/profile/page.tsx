import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Suspense } from 'react'

async function ProfileContent() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Extract user details
  const name =
    user.user_metadata?.full_name || user.user_metadata?.user_name || 'User'
  const email = user.email || ''
  const avatarUrl = user.user_metadata?.avatar_url || ''
  const providers = user.app_metadata?.providers || []
  const preferredUsername = user.user_metadata?.preferred_username || ''

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[250px_1fr]">
      <Card className="h-fit">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-2xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            {preferredUsername ? `@${preferredUsername}` : email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {providers.map((provider: string) => (
              <Badge key={provider} variant="secondary" className="capitalize">
                {provider}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your personal details as provided by your authentication provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} disabled readOnly />
          </div>

          {preferredUsername && (
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={preferredUsername}
                disabled
                readOnly
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="uid">User ID</Label>
            <Input
              id="uid"
              value={user.id}
              disabled
              readOnly
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 p-4 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your profile information.
        </p>
      </div>
      <Separator />
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
