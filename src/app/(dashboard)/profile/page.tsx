'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, Trash2, Upload } from 'lucide-react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import EditProfileForm from '@/components/profile/EditProfileForm'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm'
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog'

export default function ProfilePage() {
  const { token } = useAuthStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        toast.error('ไม่สามารถโหลดโปรไฟล์ได้')
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadAvatar = () => {
    toast('ฟีเจอร์อัปโหลดรูปภาพจะเปิดใช้งานเร็วๆ นี้', {
      icon: '📸'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ไม่พบข้อมูลโปรไฟล์</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">โปรไฟล์</h1>
        <p className="text-gray-600 mt-1">
          จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
        </p>
      </div>

      {/* Profile Header */}
      <ProfileHeader user={user} onUploadAvatar={handleUploadAvatar} />

      {/* Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Profile */}
        <EditProfileForm user={user} onUpdate={fetchProfile} />

        {/* Change Password */}
        <ChangePasswordForm />
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>สถิติบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {user.totalWorkouts}
              </p>
              <p className="text-sm text-gray-600">การออกกำลังกายทั้งหมด</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(user.totalCalories).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">แคลอรี่ที่เผาผลาญ</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(user.totalDuration / 60)}
              </p>
              <p className="text-sm text-gray-600">ชั่วโมงออกกำลังกาย</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {user.totalDistance.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">กิโลเมตร</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            การกระทำเหล่านี้ไม่สามารถย้อนกลับได้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-red-900">ลบบัญชี</h4>
              <p className="text-sm text-red-700">
                ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              ลบบัญชี
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  )
}