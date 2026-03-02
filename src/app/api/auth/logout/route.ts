import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { message: 'ออกจากระบบสำเร็จ' },
    { status: 200 }
  )
  
  // ลบ cookie
  response.cookies.delete('token')
  
  return response
}