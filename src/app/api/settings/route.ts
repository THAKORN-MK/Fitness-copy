import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { z } from 'zod'

// ── GET: โหลด preferences จาก DB ──
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)

    // upsert: ถ้ายังไม่มี row ให้สร้างด้วยค่า default
    const prefs = await prisma.userPreferences.upsert({
      where:  { userId },
      update: {},
      create: { userId },
    })

    return NextResponse.json({
      settings: {
        theme: prefs.theme,
        notifications: {
          email: true, push: false,
          goalReminders: true, weeklyReport: true,
        },
        preferences: {
          language:           prefs.language,
          weekStartsOn:       prefs.weekStartsOn,
          defaultWorkoutView: prefs.defaultWorkoutView,
        },
      }
    })

  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// ── PUT: บันทึก preferences ลง DB ──
const schema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  preferences: z.object({
    language:           z.enum(['th', 'en']).optional(),
    weekStartsOn:       z.enum(['sunday', 'monday']).optional(),
    defaultWorkoutView: z.enum(['list', 'grid']).optional(),
  }).optional(),
  notifications: z.object({
    email:         z.boolean().optional(),
    push:          z.boolean().optional(),
    goalReminders: z.boolean().optional(),
    weeklyReport:  z.boolean().optional(),
  }).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'))
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)
    const body = schema.parse(await request.json())

    const prefs = await prisma.userPreferences.upsert({
      where:  { userId },
      update: {
        ...(body.theme && { theme: body.theme }),
        ...(body.preferences?.weekStartsOn       && { weekStartsOn:       body.preferences.weekStartsOn }),
        ...(body.preferences?.language           && { language:           body.preferences.language }),
        ...(body.preferences?.defaultWorkoutView && { defaultWorkoutView: body.preferences.defaultWorkoutView }),
      },
      create: {
        userId,
        theme:              body.theme              ?? 'light',
        weekStartsOn:       body.preferences?.weekStartsOn       ?? 'monday',
        language:           body.preferences?.language           ?? 'th',
        defaultWorkoutView: body.preferences?.defaultWorkoutView ?? 'list',
      },
    })

    return NextResponse.json({
      message: 'บันทึกการตั้งค่าสำเร็จ',
      settings: {
        theme: prefs.theme,
        preferences: {
          language:           prefs.language,
          weekStartsOn:       prefs.weekStartsOn,
          defaultWorkoutView: prefs.defaultWorkoutView,
        },
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง', details: error.issues }, { status: 400 })
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}