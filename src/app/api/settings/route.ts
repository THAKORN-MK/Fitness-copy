import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'

// GET - Get user settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    
    // Get user with settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    
    // Return default settings (we'll add more fields later if needed)
    return NextResponse.json({
      settings: {
        userId: user.id,
        theme: 'light', // default
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
      }
    })
    
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update settings
const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    goalReminders: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    language: z.enum(['th', 'en']).optional(),
    weekStartsOn: z.enum(['sunday', 'monday']).optional(),
    defaultWorkoutView: z.enum(['list', 'grid']).optional(),
  }).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const body = await request.json()
    
    // Validate data
    const validatedData = updateSettingsSchema.parse(body)
    
    // In real app, you'd save to database
    // For now, we'll just return success
    
    return NextResponse.json({
      message: 'บันทึกการตั้งค่าสำเร็จ',
      settings: validatedData
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
  return NextResponse.json(
    { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
    { status: 400 }
  )
}
    
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
