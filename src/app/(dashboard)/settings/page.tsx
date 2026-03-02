'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import ThemeSettings from '@/components/settings/ThemeSettings'
import NotificationSettings from '@/components/settings/NotificationSettings'
import PreferencesSettings from '@/components/settings/PreferencesSettings'
import DataExport from '@/components/settings/DataExport'
import AccountInfo from '@/components/settings/AccountInfo'

export default function SettingsPage() {
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      goalReminders: true,
      weeklyReport: true,
    },
    preferences: {
      language: 'th',
      weekStartsOn: 'monday',
      defaultWorkoutView: 'list',
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Fetch settings error:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (theme: string) => {
    if (theme === 'light') {
      setSettings({ ...settings, theme })
      setHasChanges(true)
    } else {
      toast('ธีมนี้จะเปิดใช้งานในเวอร์ชันถัดไป', { icon: '🚀' })
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    })
    setHasChanges(true)
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('บันทึกการตั้งค่าสำเร็จ!')
        setHasChanges(false)
      } else {
        toast.error('ไม่สามารถบันทึกได้')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚙️ การตั้งค่า</h1>
          <p className="text-gray-600 mt-1">
            จัดการการตั้งค่าและความชอบส่วนตัว
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
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
        )}
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            📝 คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </p>
          <Button onClick={handleSave} disabled={saving} size="sm">
            บันทึก
          </Button>
        </div>
      )}

      {/* Two Columns Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <ThemeSettings 
            theme={settings.theme}
            onThemeChange={handleThemeChange}
          />

          <NotificationSettings
            notifications={settings.notifications}
            onNotificationChange={handleNotificationChange}
          />

          <PreferencesSettings
            preferences={settings.preferences}
            onPreferenceChange={handlePreferenceChange}
          />

          <DataExport />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          <AccountInfo user={user} />

          {/* App Info */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-semibold">ข้อมูลแอพพลิเคชัน</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">เวอร์ชัน</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สร้างโดย</span>
                <span className="font-medium">Fitness Team</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ปีที่พัฒนา</span>
                <span className="font-medium">2025</span>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                พัฒนาด้วย Next.js 14, Prisma, และ shadcn/ui
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              ต้องการความช่วยเหลือ?
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              ติดต่อทีมสนับสนุนหรือดูคู่มือการใช้งาน
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                📚 คู่มือการใช้งาน
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                💬 ติดต่อสนับสนุน
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}