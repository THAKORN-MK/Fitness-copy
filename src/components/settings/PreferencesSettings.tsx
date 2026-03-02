'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Calendar, LayoutGrid } from 'lucide-react'

interface PreferencesSettingsProps {
  preferences: {
    language: string
    weekStartsOn: string
    defaultWorkoutView: string
  }
  onPreferenceChange: (key: string, value: string) => void
}

export default function PreferencesSettings({ 
  preferences, 
  onPreferenceChange 
}: PreferencesSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ค่ากำหนด</CardTitle>
        <CardDescription>
          ตั้งค่าการแสดงผลและพฤติกรรมของแอป
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            ภาษา
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => onPreferenceChange('language', value)}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="th">🇹🇭 ภาษาไทย</SelectItem>
              <SelectItem value="en">🇬🇧 English (เร็วๆ นี้)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weekStartsOn" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            สัปดาห์เริ่มต้นวัน
          </Label>
          <Select
            value={preferences.weekStartsOn}
            onValueChange={(value) => onPreferenceChange('weekStartsOn', value)}
          >
            <SelectTrigger id="weekStartsOn">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">วันอาทิตย์</SelectItem>
              <SelectItem value="monday">วันจันทร์</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultWorkoutView" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            มุมมองการแสดงผลเริ่มต้น
          </Label>
          <Select
            value={preferences.defaultWorkoutView}
            onValueChange={(value) => onPreferenceChange('defaultWorkoutView', value)}
          >
            <SelectTrigger id="defaultWorkoutView">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">รายการ (List)</SelectItem>
              <SelectItem value="grid">ตาราง (Grid)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}