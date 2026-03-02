import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    }
    
    const { userId } = verifyToken(token)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    
    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })
    
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { exerciseDate: 'desc' }
    })
    
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    const exportData = {
      user,
      workouts,
      goals,
      exportedAt: new Date().toISOString(),
      totalWorkouts: workouts.length,
      totalGoals: goals.length,
    }
    
    if (format === 'csv') {
      // Convert workouts to CSV
      const csvHeader = 'วันที่,ประเภท,ระยะเวลา(นาที),แคลอรี่,ระยะทาง(km),ความหนัก,หมายเหตุ\n'
      const csvRows = workouts.map(w => 
        `${new Date(w.exerciseDate).toLocaleDateString('th-TH')},${w.exerciseType},${w.durationMinutes},${w.caloriesBurned},${w.distanceKm || ''},${w.intensity},"${w.notes || ''}"`
      ).join('\n')
      
      const csv = csvHeader + csvRows
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="fitness-data.csv"',
        },
      })
    }
    
    // JSON format
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': 'attachment; filename="fitness-data.json"',
      },
    })
    
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}