'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, AlertTriangle } from 'lucide-react'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const router = useRouter()
  const { token, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('กรุณาพิมพ์ DELETE เพื่อยืนยัน')
      return
    }

    if (!password) {
      toast.error('กรุณากรอกรหัสผ่าน')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password, confirmText })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('ลบบัญชีสำเร็จ')
        logout()
        router.push('/login')
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('ไม่สามารถลบบัญชีได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ลบบัญชีถาวร
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              คุณกำลังจะลบบัญชีและข้อมูลทั้งหมดอย่างถาวร 
              การกระทำนี้<strong>ไม่สามารถย้อนกลับได้</strong>
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <p className="text-sm font-semibold text-red-800">ข้อมูลที่จะถูกลบ:</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>ข้อมูลโปรไฟล์ทั้งหมด</li>
                <li>การออกกำลังกายทั้งหมด</li>
                <li>สถิติและประวัติ</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="deletePassword">ยืนยันด้วยรหัสผ่าน</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">
                  พิมพ์ <span className="font-mono font-bold">DELETE</span> เพื่อยืนยัน
                </Label>
                <Input
                  id="deleteConfirm"
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              'ลบบัญชีถาวร'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}