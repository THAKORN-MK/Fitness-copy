// src/app/api/workouts/[id]/image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function authToken(req: NextRequest) {
  return req.cookies.get('token')?.value ?? getTokenFromHeader(req.headers.get('authorization'))
}

// POST — อัปโหลดรูป
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params

  try {
    const token = authToken(req)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    const { userId } = verifyToken(token)

    const workout = await prisma.workout.findFirst({ where: { id, userId } })
    if (!workout) return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 })

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: 'รองรับเฉพาะ JPG, PNG, WEBP, HEIC' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: 'ไฟล์ต้องมีขนาดไม่เกิน 10MB' }, { status: 400 })

    // ลบรูปเก่าก่อน (ถ้ามี)
    if ((workout as any).imagePublicId) {
      await cloudinary.uploader.destroy((workout as any).imagePublicId).catch(() => {})
    }

    const bytes  = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder:         'runtrack/workouts',
      public_id:      `workout_${id}`,
      overwrite:      true,
      transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }],
    })

    await prisma.workout.update({
      where: { id },
      data: {
        imageUrl:      result.secure_url,
        imagePublicId: result.public_id,
      } as any,
    })

    return NextResponse.json({ imageUrl: result.secure_url })

  } catch (err) {
    console.error('Workout image upload error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE — ลบรูป
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params

  try {
    const token = authToken(req)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })
    const { userId } = verifyToken(token)

    const workout = await prisma.workout.findFirst({ where: { id, userId } }) as any
    if (!workout) return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 })

    if (workout.imagePublicId) {
      await cloudinary.uploader.destroy(workout.imagePublicId).catch(() => {})
    }

    await prisma.workout.update({
      where: { id },
      data:  { imageUrl: null, imagePublicId: null } as any,
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Delete workout image error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}