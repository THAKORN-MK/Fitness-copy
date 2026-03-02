'use client'

import WorkoutForm from '@/components/forms/WorkoutForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewWorkoutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/workouts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={20} />
          กลับ
        </Button>
      </Link>

      <WorkoutForm mode="create" />
    </div>
  )
}
