'use client'

import { Button } from '@/components/ui/button'
import { deleteNote } from '@/app/notes/actions'

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        await deleteNote(noteId)
      }}
    >
      Delete
    </Button>
  )
}
