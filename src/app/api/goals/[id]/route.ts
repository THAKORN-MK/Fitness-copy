import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

function authToken(request: NextRequest) {
  const cookie = request.cookies.get('token')?.value
  const header = request.headers.get('authorization')
  return cookie ?? getTokenFromHeader(header)
}

// ── DELETE — ลบ goal ──────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = authToken(request)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)
    const { id } = await params

    // ตรวจสอบว่า goal นี้เป็นของ user นี้จริง
    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal)               return NextResponse.json({ error: 'ไม่พบเป้าหมาย' },        { status: 404 })
    if (goal.userId !== userId) return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบ' },     { status: 403 })

    await prisma.goal.delete({ where: { id } })

    return NextResponse.json({ message: 'ลบเป้าหมายสำเร็จ' })

  } catch (err) {
    console.error('Delete goal error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// ── PATCH — อัปเดต goal (optional) ───────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = authToken(request)
    if (!token) return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 })

    const { userId } = verifyToken(token)
    const { id } = await params
    const body = await request.json()

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal)                  return NextResponse.json({ error: 'ไม่พบเป้าหมาย' }, { status: 404 })
    if (goal.userId !== userId) return NextResponse.json({ error: 'ไม่มีสิทธิ์' },   { status: 403 })

    const updated = await prisma.goal.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ message: 'อัปเดตสำเร็จ', goal: updated })

  } catch (err) {
    console.error('Update goal error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}