'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import WorkoutForm from '@/components/forms/WorkoutForm'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function EditWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchWorkout() }, [])

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) { const d = await res.json(); setWorkout(d.workout) }
      else { toast.error('ไม่พบข้อมูล'); router.push('/workouts') }
    } catch { toast.error('เกิดข้อผิดพลาด'); router.push('/workouts') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <Loader2 size={32} style={{ color:'#818cf8', animation:'spin 1s linear infinite' }}/>
    </div>
  )

  return workout ? (
    <WorkoutForm mode="edit" initialData={workout} workoutId={params.id as string}/>
  ) : null
}