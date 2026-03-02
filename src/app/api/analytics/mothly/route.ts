import { NextRequest, NextResponse } from 'next/server'

// Temporary compatibility: redirect misspelled route to the correct monthly route
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/analytics/monthly', request.url))
}