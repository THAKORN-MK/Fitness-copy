'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Mail, Target, BarChart } from 'lucide-react'

interface NotificationSettingsProps {
  notifications: {
    email: boolean
    push: boolean
    goalReminders: boolean
    weeklyReport: boolean
  }
  onNotificationChange: (key: string, value: boolean) => void
}

export default function NotificationSettings({ 
  notifications, 
  onNotificationChange 
}: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>การแจ้งเตือน</CardTitle>
        <CardDescription>
          จัดการการรับการแจ้งเตือนต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <Label htmlFor="email" className="font-medium cursor-pointer">
                แจ้งเตือนทางอีเมล
              </Label>
              <p className="text-sm text-gray-500">
                รับการแจ้งเตือนสำคัญทางอีเมล
              </p>
            </div>
          </div>
          <Switch
            id="email"
            checked={notifications.email}
            onCheckedChange={(checked) => onNotificationChange('email', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-purple-500" />
            <div>
              <Label htmlFor="push" className="font-medium cursor-pointer">
                Push Notifications
              </Label>
              <p className="text-sm text-gray-500">
                รับการแจ้งเตือนแบบ Push (เร็วๆ นี้)
              </p>
            </div>
          </div>
          <Switch
            id="push"
            checked={notifications.push}
            onCheckedChange={(checked) => onNotificationChange('push', checked)}
            disabled
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <Label htmlFor="goalReminders" className="font-medium cursor-pointer">
                แจ้งเตือนเป้าหมาย
              </Label>
              <p className="text-sm text-gray-500">
                เตือนความคืบหน้าและเป้าหมายที่ใกล้หมดเวลา
              </p>
            </div>
          </div>
          <Switch
            id="goalReminders"
            checked={notifications.goalReminders}
            onCheckedChange={(checked) => onNotificationChange('goalReminders', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart className="h-5 w-5 text-orange-500" />
            <div>
              <Label htmlFor="weeklyReport" className="font-medium cursor-pointer">
                รายงานประจำสัปดาห์
              </Label>
              <p className="text-sm text-gray-500">
                รับสรุปสถิติทุกวันอาทิตย์
              </p>
            </div>
          </div>
          <Switch
            id="weeklyReport"
            checked={notifications.weeklyReport}
            onCheckedChange={(checked) => onNotificationChange('weeklyReport', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}