'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Edit, Trash2, Clock, Flame, Route } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/authStore'

interface WorkoutCardProps {
  workout: any
  onDelete: () => void
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'เบา'
      case 'medium': return 'ปานกลาง'
      case 'high': return 'หนัก'
      default: return intensity
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('ลบสำเร็จ')
        onDelete()
      } else {
        toast.error('ไม่สามารถลบได้')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-900">{workout.exerciseType}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getIntensityColor(workout.intensity)}`}>
                  {getIntensityLabel(workout.intensity)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {format(new Date(workout.exerciseDate), 'PPP - HH:mm น.', { locale: th })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/workouts/${workout.id}/edit`)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 p-0 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100/50 rounded-lg mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900">{workout.durationMinutes}</p>
              <p className="text-xs text-gray-500">นาที</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <p className="font-bold text-gray-900">{workout.caloriesBurned}</p>
              <p className="text-xs text-gray-500">cal</p>
            </div>
            {workout.distanceKm && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                  <Route className="h-4 w-4 text-green-600" />
                </div>
                <p className="font-bold text-gray-900">{workout.distanceKm}</p>
                <p className="text-xs text-gray-500">km</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {workout.notes && (
            <p className="text-sm text-gray-600 italic line-clamp-2">
              "{workout.notes}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบการออกกำลังกาย "{workout.exerciseType}" นี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}