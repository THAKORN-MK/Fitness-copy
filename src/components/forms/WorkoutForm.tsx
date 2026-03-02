'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Save, X } from 'lucide-react'
import { format } from 'date-fns'

interface WorkoutFormProps {
  mode: 'create' | 'edit'
  initialData?: any
  workoutId?: string
}

const exerciseTypes = [
  { value: 'วิ่ง', label: '🏃 วิ่ง', hasDistance: true },
  { value: 'เดิน', label: '🚶 เดิน', hasDistance: true },
  { value: 'ปั่นจักรยาน', label: '🚴 ปั่นจักรยาน', hasDistance: true },
  { value: 'ว่ายน้ำ', label: '🏊 ว่ายน้ำ', hasDistance: true },
  { value: 'ยิม', label: '🏋️ ยิม', hasDistance: false },
  { value: 'โยคะ', label: '🧘 โยคะ', hasDistance: false },
  { value: 'แอโรบิก', label: '💃 แอโรบิก', hasDistance: false },
  { value: 'กีฬาทีม', label: '⚽ กีฬาทีม', hasDistance: false },
  { value: 'อื่นๆ', label: '🎯 อื่นๆ', hasDistance: false },
]

export default function WorkoutForm({ mode, initialData, workoutId }: WorkoutFormProps) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    exerciseType: initialData?.exerciseType || '',
    durationMinutes: initialData?.durationMinutes || '',
    caloriesBurned: initialData?.caloriesBurned || '',
    distanceKm: initialData?.distanceKm || '',
    intensity: initialData?.intensity || 'medium',
    notes: initialData?.notes || '',
    exerciseDate: initialData?.exerciseDate 
      ? format(new Date(initialData.exerciseDate), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  })

  const selectedExercise = exerciseTypes.find(e => e.value === formData.exerciseType)
  const showDistanceField = selectedExercise?.hasDistance

  const calculateCalories = () => {
    const duration = parseInt(formData.durationMinutes as string) || 0
    const intensity = formData.intensity
    
    let caloriesPerMinute = 5 // default
    
    if (intensity === 'low') caloriesPerMinute = 3
    else if (intensity === 'medium') caloriesPerMinute = 6
    else if (intensity === 'high') caloriesPerMinute = 10
    
    const estimated = duration * caloriesPerMinute
    setFormData({ ...formData, caloriesBurned: estimated.toString() })
    toast.success(`คำนวณแล้ว: ${estimated} แคลอรี่`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        exerciseType: formData.exerciseType,
        durationMinutes: parseInt(formData.durationMinutes as string),
        caloriesBurned: parseFloat(formData.caloriesBurned as string),
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm as string) : null,
        intensity: formData.intensity,
        notes: formData.notes || null,
        exerciseDate: new Date(formData.exerciseDate).toISOString(),
      }

      const url = mode === 'create' 
        ? '/api/workouts'
        : `/api/workouts/${workoutId}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(mode === 'create' ? 'บันทึกสำเร็จ!' : 'อัปเดตสำเร็จ!')
        router.push('/workouts')
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('ไม่สามารถบันทึกได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'เพิ่มการออกกำลังกาย' : 'แก้ไขการออกกำลังกาย'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exercise Type */}
          <div className="space-y-2">
            <Label htmlFor="exerciseType">ประเภทการออกกำลังกาย *</Label>
            <Select
              value={formData.exerciseType}
              onValueChange={(value) => setFormData({ ...formData, exerciseType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภท..." />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exerciseDate">วันที่และเวลา *</Label>
              <Input
                id="exerciseDate"
                type="datetime-local"
                value={formData.exerciseDate}
                onChange={(e) => setFormData({ ...formData, exerciseDate: e.target.value })}
                required
                max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">ระยะเวลา (นาที) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="1"
                max="1440"
                placeholder="30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Calories and Distance */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="caloriesBurned">แคลอรี่ที่เผาผลาญ *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={calculateCalories}
                  disabled={!formData.durationMinutes}
                >
                  คำนวณอัตโนมัติ
                </Button>
              </div>
              <Input
                id="caloriesBurned"
                type="number"
                min="0"
                step="0.01"
                placeholder="320"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                required
              />
            </div>

            {showDistanceField && (
              <div className="space-y-2">
                <Label htmlFor="distanceKm">ระยะทาง (km)</Label>
                <Input
                  id="distanceKm"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.0"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <Label>ความหนัก</Label>
            <div className="flex gap-4">
              {[
                { value: 'low', label: 'เบา', color: 'bg-green-100 text-green-700 border-green-300' },
                { value: 'medium', label: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                { value: 'high', label: 'หนัก', color: 'bg-red-100 text-red-700 border-red-300' },
              ].map((intensity) => (
                <button
                  key={intensity.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, intensity: intensity.value })}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    formData.intensity === intensity.value
                      ? intensity.color + ' font-semibold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {intensity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="notes"
              placeholder="เช่น รู้สึกดีมาก, เหนื่อยนิดหน่อย, ทำครั้งแรก..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === 'create' ? 'บันทึก' : 'อัปเดต'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/workouts')}
              disabled={loading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              ยกเลิก
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}