'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

interface AccountInfoProps {
  user: any
}

export default function AccountInfo({ user }: AccountInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลบัญชี</CardTitle>
        <CardDescription>
          ข้อมูลพื้นฐานของบัญชีของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">ชื่อผู้ใช้</p>
            <p className="font-medium">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">อีเมล</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">สมัครสมาชิกเมื่อ</p>
            <p className="font-medium">
              {user.createdAt ? format(new Date(user.createdAt), 'PPP', { locale: th }) : '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Shield className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">สถานะบัญชี</p>
            <p className="font-medium text-green-600">ใช้งานปกติ</p>
          </div>
        </div>

        <Link href="/profile">
          <Button variant="outline" className="w-full">
            แก้ไขข้อมูลส่วนตัว
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}