'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeSettingsProps {
  theme: string
  onThemeChange: (theme: string) => void
}

export default function ThemeSettings({ theme, onThemeChange }: ThemeSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ธีม</CardTitle>
        <CardDescription>
          เลือกธีมที่คุณต้องการใช้งาน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={onThemeChange}>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center gap-2 flex-1 cursor-pointer">
              <Sun className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Light</p>
                <p className="text-sm text-gray-500">ธีมสว่าง</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center gap-2 flex-1 cursor-pointer">
              <Moon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Dark</p>
                <p className="text-sm text-gray-500">ธีมมืด (เร็วๆ นี้)</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center gap-2 flex-1 cursor-pointer">
              <Monitor className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">System</p>
                <p className="text-sm text-gray-500">ตามระบบ (เร็วๆ นี้)</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>หมายเหตุ:</strong> ธีมมืดและธีมตามระบบจะเปิดใช้งานในเวอร์ชันถัดไป
          </p>
        </div>
      </CardContent>
    </Card>
  )
}