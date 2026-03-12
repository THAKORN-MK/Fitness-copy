// src/app/api/profile/avatar/route.ts
// npm install cloudinary
// .env: CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader  = request.headers.get('authorization')
    const token       = cookieToken ?? getTokenFromHeader(authHeader)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)

    const formData = await request.formData()
    const file     = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })

    // validate
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: 'รองรับเฉพาะ JPG, PNG, WEBP, GIF' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB' }, { status: 400 })

    // convert File → buffer → base64
    const bytes  = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder:         'runtrack/avatars',
      public_id:      `user_${userId}`,
      overwrite:      true,
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    })

    // save url to db
    await prisma.user.update({
      where: { id: userId },
      data:  { avatarUrl: result.secure_url },
    })

    return NextResponse.json({ avatarUrl: result.secure_url })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}