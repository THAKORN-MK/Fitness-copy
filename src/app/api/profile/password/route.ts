import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const body = await request.json()
    
    // Validate data
    const validatedData = changePasswordSchema.parse(body)
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash
    )
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10)
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })
    
    return NextResponse.json({
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}