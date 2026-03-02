'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react'

export default function DataExport() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (format: 'json' | 'csv') => {
    setLoading(format)
    
    try {
      const response = await fetch(`/api/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fitness-data.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success(`ดาวน์โหลดข้อมูล ${format.toUpperCase()} สำเร็จ!`)
      } else {
        toast.error('ไม่สามารถดาวน์โหลดข้อมูลได้')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ส่งออกข้อมูล</CardTitle>
        <CardDescription>
          ดาวน์โหลดข้อมูลทั้งหมดของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          คุณสามารถส่งออกข้อมูลทั้งหมดของคุณในรูปแบบ JSON หรือ CSV
          เพื่อนำไปใช้งานหรือสำรองข้อมูล
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">JSON Format</h4>
            </div>
            <p className="text-sm text-gray-600">
              รูปแบบข้อมูลที่สมบูรณ์ รวมข้อมูลทั้งหมด
            </p>
            <Button
              onClick={() => handleExport('json')}
              disabled={loading !== null}
              className="w-full gap-2"
              variant="outline"
            >
              {loading === 'json' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังดาวน์โหลด...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด JSON
                </>
              )}
            </Button>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold">CSV Format</h4>
            </div>
            <p className="text-sm text-gray-600">
              เหมาะสำหรับเปิดด้วย Excel หรือ Google Sheets
            </p>
            <Button
              onClick={() => handleExport('csv')}
              disabled={loading !== null}
              className="w-full gap-2"
              variant="outline"
            >
              {loading === 'csv' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังดาวน์โหลด...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด CSV
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ ข้อมูลที่ส่งออกจะรวม: โปรไฟล์, การออกกำลังกายทั้งหมด, และเป้าหมายทั้งหมด
          </p>
        </div>
      </CardContent>
    </Card>
  )
}