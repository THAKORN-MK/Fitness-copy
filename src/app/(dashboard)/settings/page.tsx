'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useSettingsStore } from '@/lib/store/settingsStore'
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
  const { weekStartsOn, language, viewMode, setWeekStartsOn, setLanguage, setViewMode } = useSettingsStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const originalRef = useRef<string>('')

  const [settings, setSettings] = useState({
    theme: 'dark',
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

  useEffect(() => { fetchSettings() }, [])

  // track changes vs original
  useEffect(() => {
    if (!loading) {
      setIsDirty(JSON.stringify(settings) !== originalRef.current)
    }
  }, [settings])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        originalRef.current = JSON.stringify(data.settings)
        const p = data.settings?.preferences
        if (p?.weekStartsOn)        setWeekStartsOn(p.weekStartsOn)
        if (p?.language)            setLanguage(p.language)
        if (p?.defaultWorkoutView)  setViewMode(p.defaultWorkoutView)
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
      setSettings(prev => ({ ...prev, theme }))
    } else {
      toast('ธีมนี้จะเปิดใช้งานในเวอร์ชันถัดไป', { icon: '🚀' })
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }))
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }))
    if (key === 'weekStartsOn')           setWeekStartsOn(value as 'sunday' | 'monday')
    else if (key === 'language')           setLanguage(value as 'th' | 'en')
    else if (key === 'defaultWorkoutView') setViewMode(value as 'list' | 'grid')
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
        originalRef.current = JSON.stringify(settings)
        setIsDirty(false)
        toast.success('บันทึกการตั้งค่าสำเร็จ!')
      } else {
        const err = await response.json()
        console.error('Save error:', err)
        toast.error('ไม่สามารถบันทึกได้')
      }
    } catch (error) {
      console.error('Save error:', error)
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
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>⚙️ การตั้งค่า</h1>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>จัดการการตั้งค่าและความชอบส่วนตัว</p>
        </div>

        {/* Save button — แสดงเฉพาะเมื่อมีการเปลี่ยนแปลง */}
        <div style={{
          transition: 'opacity .2s, transform .2s',
          opacity: isDirty ? 1 : 0,
          transform: isDirty ? 'translateY(0)' : 'translateY(-6px)',
          pointerEvents: isDirty ? 'auto' : 'none',
        }}>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #818cf8, #7c3aed)',
              border: 'none',
              borderRadius: 12,
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />กำลังบันทึก...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />บันทึกการตั้งค่า</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ThemeSettings theme={settings.theme} onThemeChange={handleThemeChange} />
          <NotificationSettings notifications={settings.notifications} onNotificationChange={handleNotificationChange} />
          <PreferencesSettings
            preferences={settings.preferences}
            onPreferenceChange={handlePreferenceChange}
          />
          <DataExport />
        </div>

        <div className="space-y-6">
          <AccountInfo user={user} />
          <div className="p-4 border rounded-lg space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h4 className="font-semibold">ข้อมูลแอพพลิเคชัน</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>เวอร์ชัน</span><span className="font-medium">1.0.0</span></div>
              <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>สร้างโดย</span><span className="font-medium">Fitness Team</span></div>
              <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>ปีที่พัฒนา</span><span className="font-medium">2025</span></div>
            </div>
            <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>พัฒนาด้วย Next.js 14, Prisma, และ shadcn/ui</p>
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#a5b4fc' }}>ต้องการความช่วยเหลือ?</h4>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>ติดต่อทีมสนับสนุนหรือดูคู่มือการใช้งาน</p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">📚 คู่มือการใช้งาน</Button>
              <Button variant="outline" size="sm" className="w-full">💬 ติดต่อสนับสนุน</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}