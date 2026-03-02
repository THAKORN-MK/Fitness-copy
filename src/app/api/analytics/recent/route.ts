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
    
    // Get 5 most recent workouts
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { exerciseDate: 'desc' },
      take: 5,
    })
    
    return NextResponse.json({ workouts })
    
  } catch (error) {
    console.error('Recent workouts error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}