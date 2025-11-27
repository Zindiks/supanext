# CLAUDE.md - Development Guidelines

## Project Overview

**SupaNext** is a productivity platform for solo entrepreneurs and developers, functioning as a project management tool with AI capabilities. It combines project management (kanban boards), knowledge management, focus tools, documentation storage, and collaborative features like whiteboards.

### Vision
- Mini Jira with integrated knowledge bank
- All-in-one workspace for solo developers
- AI-powered assistance for project planning and execution
- Focus on simplicity and developer experience

### Planned Features
- Kanban boards for task management
- Knowledge bank / documentation storage
- Focus tools and time management
- Whiteboard / Excalidraw integration
- AI-powered project insights
- Real-time collaboration (future)

---

## Tech Stack

### Core Framework
- **Next.js** (latest) - App Router with React Server Components (RSC)
- **React 19** - Latest React features
- **TypeScript 5** - Strict mode enabled

### Backend & Database
- **Supabase** - Authentication, Database (PostgreSQL), Real-time, Storage
- **@supabase/ssr** - Server-side auth for Next.js
- **@supabase/supabase-js** - Client library

### UI & Styling
- **shadcn/ui** - Component library (New York style)
- **Tailwind CSS 4** - Utility-first CSS with OKLCH colors
- **Radix UI** - Unstyled accessible components
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

### State & Data Fetching
- **TanStack Query (React Query)** - Server state management (to be added)

### Code Quality
- **ESLint** - Linting
- **TypeScript** - Type safety

---

## Project Structure

```
supanext/
├── app/                      # Next.js App Router
│   ├── auth/                # Authentication pages & actions
│   │   ├── actions.ts       # Server actions for auth
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── ...
│   ├── protected/           # Protected routes (require auth)
│   │   └── profile/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── tutorial/            # Tutorial components
├── lib/                     # Utility functions & configs
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Client-side Supabase
│   │   ├── server.ts       # Server-side Supabase
│   │   └── proxy.ts        # Proxy configuration
│   └── utils.ts            # Utility functions (cn, etc.)
├── components.json          # shadcn/ui configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Development Rules

### 1. File Organization

#### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`, `KanbanBoard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiHelpers.ts`)
- **Server Actions**: `actions.ts` in feature directories
- **Route Handlers**: `route.ts` for API routes
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)

#### File Structure Pattern
```
feature-name/
├── components/          # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/              # Custom hooks
│   └── useFeature.ts
├── types/              # TypeScript types
│   └── feature.types.ts
├── actions.ts          # Server actions
├── queries.ts          # TanStack Query queries
└── page.tsx           # Route page
```

### 2. Import Organization

Always organize imports in this order:
```typescript
// 1. React and Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'

// 3. Internal utilities and configs
import { cn } from '@/lib/utils'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

// 4. Components (external first, then internal)
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/UserAvatar'

// 5. Types
import type { User } from '@/types/user.types'

// 6. Styles (if any)
import styles from './component.module.css'
```

### 3. Component Patterns

#### Server Components (Default)
- Use for data fetching, SEO-critical content
- Can directly access Supabase server client
- Cannot use hooks or browser APIs
- Should be async when fetching data

```typescript
// app/protected/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*')

  return <DashboardView projects={data} />
}
```

#### Client Components
- Add `'use client'` directive at the top
- Use for interactivity, hooks, browser APIs
- Use Supabase client-side client
- Prefer composition over large client components

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InteractiveWidget() {
  const [count, setCount] = useState(0)

  return (
    <Button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </Button>
  )
}
```

### 4. TanStack Query Guidelines

#### Setup QueryClient
```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

#### Query Patterns
```typescript
// hooks/useProjects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useProjects() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (project: NewProject) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

#### Query Key Conventions
```typescript
// lib/queryKeys.ts
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (projectId: string) => [...queryKeys.tasks.lists(), projectId] as const,
  },
}
```

### 5. Supabase Patterns

#### Client-Side Usage
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function ClientComponent() {
  const supabase = createClient()

  const handleAction = async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')

    if (error) {
      console.error('Error:', error.message)
      return
    }

    // Handle data
  }
}
```

#### Server-Side Usage
```typescript
// app/protected/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

#### Server Actions
```typescript
// app/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const project = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  }

  const { error } = await supabase
    .from('projects')
    .insert(project)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { success: true }
}
```

### 6. TypeScript Guidelines

#### Strict Type Safety
- Enable strict mode in tsconfig.json
- Avoid `any` - use `unknown` when type is truly unknown
- Use TypeScript utility types: `Partial`, `Pick`, `Omit`, `Record`
- Define explicit return types for functions

#### Type Definitions
```typescript
// types/database.types.ts
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          user_id: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
    }
  }
}

// types/project.types.ts
export type Project = Database['public']['Tables']['projects']['Row']
export type NewProject = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
```

#### Type-Safe Components
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'default', size = 'default', children, onClick }: ButtonProps) {
  // Implementation
}
```

### 7. Styling Guidelines

#### Use Tailwind CSS Utilities
```typescript
// Good: Utility classes
<div className="flex items-center gap-4 rounded-lg border p-4">

// Avoid: Inline styles unless dynamic
<div style={{ padding: '16px' }}>
```

#### Use cn() for Conditional Classes
```typescript
import { cn } from '@/lib/utils'

<Button
  className={cn(
    "base-classes",
    isActive && "active-classes",
    variant === 'destructive' && "destructive-classes"
  )}
/>
```

#### shadcn/ui Component Usage
```typescript
// Install new component
npx shadcn@latest add dialog

// Use in code
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

<Dialog>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
  </DialogContent>
</Dialog>
```

### 8. Error Handling

#### Client-Side
```typescript
'use client'

import { toast } from 'sonner' // when added

try {
  const result = await riskyOperation()
  toast.success('Operation successful')
} catch (error) {
  console.error('Operation failed:', error)
  toast.error(error instanceof Error ? error.message : 'Something went wrong')
}
```

#### Server-Side
```typescript
'use server'

export async function serverAction() {
  try {
    // Operation
    return { success: true, data }
  } catch (error) {
    console.error('Server action failed:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### 9. Security Best Practices

#### Never Expose Secrets
- Use environment variables for sensitive data
- Never commit `.env` files
- Use `.env.local` for local development

#### Row Level Security (RLS)
- Always enable RLS on Supabase tables
- Define policies for select, insert, update, delete
- Use `auth.uid()` to restrict access to user's own data

```sql
-- Example RLS Policy
CREATE POLICY "Users can only view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);
```

#### Input Validation
```typescript
// Server actions - validate all inputs
'use server'

import { z } from 'zod' // when added

const ProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export async function createProject(input: unknown) {
  const parsed = ProjectSchema.safeParse(input)

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  // Proceed with parsed.data
}
```

### 10. Performance Guidelines

#### Code Splitting
- Use dynamic imports for heavy components
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

#### Image Optimization
```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // for above-the-fold images
/>
```

#### Memoization
```typescript
import { useMemo, useCallback } from 'react'

// Expensive calculations
const computedValue = useMemo(() => expensiveCalculation(data), [data])

// Callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

---

## Code Review Checklist

Before committing code, verify:

- [ ] TypeScript has no errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console.logs in production code
- [ ] Proper error handling implemented
- [ ] Components are properly typed
- [ ] Server/Client components used appropriately
- [ ] Imports are organized correctly
- [ ] No sensitive data exposed
- [ ] RLS policies exist for new tables
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] Dark mode works correctly
- [ ] Loading and error states handled

---

## Git Workflow

### Branch Naming
- Feature: `feature/kanban-board`
- Bug fix: `fix/auth-redirect-issue`
- Chore: `chore/update-dependencies`

### Commit Messages
Follow conventional commits:
```
feat: add kanban board component
fix: resolve authentication redirect loop
chore: update dependencies
docs: add setup instructions
refactor: simplify query hooks
style: format code with prettier
test: add unit tests for projects
```

---

## Environment Variables

Required environment variables (`.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Future Considerations

### Features to Add
- TanStack Query integration (priority)
- Sonner for toast notifications
- Zod for runtime validation
- React Hook Form for forms
- Zustand for client-side state (if needed)
- Recharts for analytics
- Framer Motion for animations

### Database Schema Planning
- Projects table
- Tasks table with kanban columns
- Documents/Knowledge base table
- User preferences table
- AI prompts/history table

### Architecture Decisions
- Keep Server Components as default
- Use Client Components only when necessary
- Prefer server actions over API routes
- Use TanStack Query for all data fetching in Client Components
- Implement optimistic updates for better UX

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
