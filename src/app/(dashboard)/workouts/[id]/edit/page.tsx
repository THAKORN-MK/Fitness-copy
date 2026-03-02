'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorkoutForm from '@/components/forms/WorkoutForm'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkout()
  }, [])

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkout(data.workout)
      } else {
        toast.error('ไม่พบข้อมูล')
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Fetch workout error:', error)
      toast.error('เกิดข้อผิดพลาด')
      router.push('/workouts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/workouts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={20} />
          กลับ
        </Button>
      </Link>

      {workout && (
        <WorkoutForm
          mode="edit"
          initialData={workout}
          workoutId={params.id as string}
        />
      )}
    </div>
  )
}