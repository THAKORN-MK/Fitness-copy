import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes ที่ต้อง login
const protectedRoutes = ['/dashboard', '/workouts', '/analytics', '/profile']

// Routes ที่ login แล้วไม่ควรเข้า (redirect ไป dashboard)
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ตรวจสอบว่าเป็น protected route หรือไม่
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // ดึง token จาก cookie หรือ header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // ถ้าเป็น protected route แต่ไม่มี token
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  
  // ถ้ามี token ให้ verify
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      )
      
      await jwtVerify(token, secret)
      
      // ถ้า login แล้วและพยายามเข้า login/register → redirect ไป dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
    } catch (error) {
      // Token ไม่ถูกต้อง
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('token')
        return response
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}