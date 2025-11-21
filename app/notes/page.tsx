import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { AddNoteForm } from '@/components/add-note-form'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeleteNoteButton } from '@/components/delete-note-button'

async function NotesContent() {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select()

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <p className="text-muted-foreground">{note.description}</p>
            </CardHeader>
            <CardFooter>
              <DeleteNoteButton noteId={note.id} />
            </CardFooter>
          </Card>
        ))}
        {(!notes || notes.length === 0) && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No notes yet. Add one above!
          </p>
        )}
      </div>
      <AddNoteForm />
    </div>
  )
}

export default function Page() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Notes</h1>
      <Suspense fallback={<div>Loading notes...</div>}>
        <NotesContent />
      </Suspense>
    </div>
  )
}
