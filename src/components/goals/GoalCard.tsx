'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
import { format, differenceInDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { 
  Target, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Activity,
  Flame,
  Route
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'

interface GoalCardProps {
  goal: any
  onDelete: () => void
}

export default function GoalCard({ goal, onDelete }: GoalCardProps) {
  const { token } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const progress = Math.min(
    (Number(goal.currentValue) / Number(goal.targetValue)) * 100,
    100
  )

  const daysLeft = differenceInDays(new Date(goal.endDate), new Date())
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'failed': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-blue-100 text-blue-700 border-blue-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'สำเร็จ'
      case 'failed': return 'ไม่สำเร็จ'
      default: return 'กำลังดำเนินการ'
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'workouts': return Activity
      case 'calories': return Flame
      case 'duration': return Clock
      case 'distance': return Route
      default: return Target
    }
  }

  const getTargetLabel = (type: string) => {
    switch (type) {
      case 'workouts': return 'ครั้ง'
      case 'calories': return 'cal'
      case 'duration': return 'นาที'
      case 'distance': return 'km'
      default: return ''
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'รายวัน'
      case 'weekly': return 'รายสัปดาห์'
      case 'monthly': return 'รายเดือน'
      default: return period
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('ลบเป้าหมายสำเร็จ')
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

  const Icon = getTargetIcon(goal.targetType)

  return (
    <>
      <Card className={`${goal.status === 'completed' ? 'border-green-300' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {getStatusLabel(goal.status)}
                </span>
              </div>
              {goal.description && (
                <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {getPeriodLabel(goal.period)} • สิ้นสุด {format(new Date(goal.endDate), 'PPP', { locale: th })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ความคืบหน้า</span>
              <span className="font-semibold">
                {Number(goal.currentValue).toLocaleString()} / {Number(goal.targetValue).toLocaleString()} {getTargetLabel(goal.targetType)}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.toFixed(0)}% เสร็จสิ้น</span>
              {goal.status === 'active' && daysLeft >= 0 && (
                <span>เหลืออีก {daysLeft} วัน</span>
              )}
              {goal.status === 'completed' && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  สำเร็จ!
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบเป้าหมาย "{goal.title}" นี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
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