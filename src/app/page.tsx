import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">🏃 Fitness Tracker</h1>
        <p className="text-xl text-gray-600">
          ระบบบันทึกการออกกำลังกาย
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button>เข้าสู่ระบบ</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">สมัครสมาชิก</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}