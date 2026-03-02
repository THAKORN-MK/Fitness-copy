import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization')
    const token = cookieToken ?? getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }

    const { userId } = verifyToken(token)
    
    // Group by intensity
    const intensityStats = await prisma.workout.groupBy({
      by: ['intensity'],
      where: { userId },
      _count: {
        id: true
      },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
      }
    })
    
    const data = intensityStats.map(stat => ({
      intensity: stat.intensity,
      count: stat._count.id,
      calories: Number(stat._sum?.caloriesBurned ?? 0) || 0,
      duration: stat._sum?.durationMinutes ?? 0,
    }))
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('Intensity analytics error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}