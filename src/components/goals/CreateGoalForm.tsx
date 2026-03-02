'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Plus } from 'lucide-react'

interface CreateGoalFormProps {
  onSuccess: () => void
}

const targetTypes = [
  { value: 'workouts', label: '🏃 จำนวนการออกกำลังกาย', unit: 'ครั้ง' },
  { value: 'calories', label: '🔥 แคลอรี่ที่เผาผลาญ', unit: 'cal' },
  { value: 'duration', label: '⏱️ เวลาออกกำลังกาย', unit: 'นาที' },
  { value: 'distance', label: '📍 ระยะทาง', unit: 'km' },
]

const periods = [
  { value: 'daily', label: 'รายวัน' },
  { value: 'weekly', label: 'รายสัปดาห์' },
  { value: 'monthly', label: 'รายเดือน' },
]

export default function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetType: '',
    targetValue: '',
    period: '',
  })

  const selectedType = targetTypes.find(t => t.value === formData.targetType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          targetValue: parseFloat(formData.targetValue)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('สร้างเป้าหมายสำเร็จ!')
        setFormData({
          title: '',
          description: '',
          targetType: '',
          targetValue: '',
          period: '',
        })
        onSuccess()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถสร้างเป้าหมายได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สร้างเป้าหมายใหม่</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">ชื่อเป้าหมาย *</Label>
            <Input
              id="title"
              placeholder="เช่น ออกกำลังกายสัปดาห์ละ 5 วัน"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              placeholder="เพิ่มรายละเอียด (ไม่บังคับ)"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetType">ประเภทเป้าหมาย *</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => setFormData({ ...formData, targetType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท..." />
                </SelectTrigger>
                <SelectContent>
                  {targetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">ช่วงเวลา *</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกช่วงเวลา..." />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetValue">ค่าเป้าหมาย *</Label>
            <div className="flex gap-2">
              <Input
                id="targetValue"
                type="number"
                min="1"
                step="any"
                placeholder="100"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                required
                disabled={loading}
                className="flex-1"
              />
              {selectedType && (
                <div className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600">
                  {selectedType.unit}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                สร้างเป้าหมาย
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}