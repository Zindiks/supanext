'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addNote(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const createdAt = new Date()

  if (!title) {
    return
  }

  await supabase.from('notes').insert({
    title,
    description,
    created_at: createdAt,
  })

  revalidatePath('/notes')
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  await supabase.from('notes').delete().eq('id', id)

  revalidatePath('/notes')
}
