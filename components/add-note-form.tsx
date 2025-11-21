'use client'

import { addNote } from '@/app/notes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRef } from 'react'

export function AddNoteForm() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={async (formData) => {
            await addNote(formData)
            formRef.current?.reset()
          }}
          className="flex flex-col gap-4"
        >
          <Input name="title" placeholder="Enter note title..." required />
          <Input
            name="description"
            placeholder="Enter note description..."
            required
          />
          <Button type="submit">Add Note</Button>
        </form>
      </CardContent>
    </Card>
  )
}
