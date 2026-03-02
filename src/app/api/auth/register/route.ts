import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation Schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email หรือ Username นี้ถูกใช้แล้ว' },
        { status: 409 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(
      { message: 'สมัครสมาชิกสำเร็จ', user },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
  return NextResponse.json(
    { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
    { status: 400 }
  )
}
    
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
