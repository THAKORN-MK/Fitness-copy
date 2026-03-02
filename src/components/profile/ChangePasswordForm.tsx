'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordForm() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('เปลี่ยนรหัสผ่านสำเร็จ!')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถเปลี่ยนรหัสผ่านได้')
    } finally {
      setLoading(false)
    }
  }

  const PasswordInput = ({ 
    id, 
    label, 
    value, 
    onChange, 
    show, 
    onToggleShow 
  }: any) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          disabled={loading}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          เปลี่ยนรหัสผ่าน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            id="currentPassword"
            label="รหัสผ่านปัจจุบัน"
            value={formData.currentPassword}
            onChange={(e: any) => setFormData({ ...formData, currentPassword: e.target.value })}
            show={showPasswords.current}
            onToggleShow={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
          />

          <PasswordInput
            id="newPassword"
            label="รหัสผ่านใหม่"
            value={formData.newPassword}
            onChange={(e: any) => setFormData({ ...formData, newPassword: e.target.value })}
            show={showPasswords.new}
            onToggleShow={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
          />

          <PasswordInput
            id="confirmPassword"
            label="ยืนยันรหัสผ่านใหม่"
            value={formData.confirmPassword}
            onChange={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })}
            show={showPasswords.confirm}
            onToggleShow={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเปลี่ยนรหัสผ่าน...
              </>
            ) : (
              'เปลี่ยนรหัสผ่าน'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}