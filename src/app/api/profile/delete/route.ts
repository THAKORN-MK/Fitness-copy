import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'กรุณากรอกรหัสผ่านเพื่อยืนยัน'),
  confirmText: z.string().refine((val) => val === 'DELETE', {
    message: 'กรุณาพิมพ์ DELETE เพื่อยืนยัน'
  })
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
    const validatedData = deleteAccountSchema.parse(body)
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    )
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 400 }
      )
    }
    
    // Delete all user's workouts first
    await prisma.workout.deleteMany({
      where: { userId }
    })
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })
    
    const response = NextResponse.json({
      message: 'ลบบัญชีสำเร็จ'
    })
    
    // Clear cookie
    response.cookies.delete('token')
    
    return response
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}