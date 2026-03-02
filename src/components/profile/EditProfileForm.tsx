'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'

interface EditProfileFormProps {
  user: any
  onUpdate: () => void
}

export default function EditProfileForm({ user, onUpdate }: EditProfileFormProps) {
  const { token, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('อัปเดตโปรไฟล์สำเร็จ!')
        updateUser(data.user)
        onUpdate()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถอัปเดตได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>แก้ไขโปรไฟล์</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              ชื่อผู้ใช้ไม่สามารถเปลี่ยนแปลงได้
            </p>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}