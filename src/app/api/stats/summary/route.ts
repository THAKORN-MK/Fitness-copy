import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'ไม่พบ token' },
        { status: 401 }
      )
    }
    
    const { userId } = verifyToken(token)
    
    // Get date ranges
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Total stats
    const totalWorkouts = await prisma.workout.count({
      where: { userId }
    })
    
    const totalStats = await prisma.workout.aggregate({
      where: { userId },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
        distanceKm: true,
      }
    })
    
    // This week stats
    const weekWorkouts = await prisma.workout.count({
      where: {
        userId,
        exerciseDate: {
          gte: weekAgo
        }
      }
    })
    
    const weekStats = await prisma.workout.aggregate({
      where: {
        userId,
        exerciseDate: {
          gte: weekAgo
        }
      },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
      }
    })
    
    // Previous week for comparison
    const twoWeeksAgo = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
    const prevWeekWorkouts = await prisma.workout.count({
      where: {
        userId,
        exerciseDate: {
          gte: twoWeeksAgo,
          lt: weekAgo
        }
      }
    })
    
    const prevWeekStats = await prisma.workout.aggregate({
      where: {
        userId,
        exerciseDate: {
          gte: twoWeeksAgo,
          lt: weekAgo
        }
      },
      _sum: {
        caloriesBurned: true,
        durationMinutes: true,
      }
    })
    
    // Calculate changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }
    
    return NextResponse.json({
      total: {
        workouts: totalWorkouts,
        calories: Number(totalStats._sum.caloriesBurned) || 0,
        duration: totalStats._sum.durationMinutes || 0,
        distance: Number(totalStats._sum.distanceKm) || 0,
      },
      thisWeek: {
        workouts: weekWorkouts,
        calories: Number(weekStats._sum.caloriesBurned) || 0,
        duration: weekStats._sum.durationMinutes || 0,
      },
      changes: {
        workouts: calculateChange(
          weekWorkouts,
          prevWeekWorkouts
        ),
        calories: calculateChange(
          Number(weekStats._sum.caloriesBurned) || 0,
          Number(prevWeekStats._sum.caloriesBurned) || 0
        ),
        duration: calculateChange(
          weekStats._sum.durationMinutes || 0,
          prevWeekStats._sum.durationMinutes || 0
        ),
      }
    })
    
  } catch (error) {
    console.error('Stats summary error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}