'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import WorkoutCard from '@/components/workout/WorkoutCard'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'

const exerciseTypes = [
  'ทั้งหมด',
  'วิ่ง',
  'เดิน',
  'ปั่นจักรยาน',
  'ว่ายน้ำ',
  'ยิม',
  'โยคะ',
  'แอโรบิก',
  'กีฬาทีม',
  'อื่นๆ',
]

export default function WorkoutsPage() {
  const { token } = useAuthStore()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ทั้งหมด')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchWorkouts()
  }, [page, filterType])

  const fetchWorkouts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (filterType !== 'ทั้งหมด') {
        params.append('exerciseType', filterType)
      }

      const response = await fetch(`/api/workouts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkouts(data.workouts)
        setPagination(data.pagination)
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (error) {
      console.error('Fetch workouts error:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    fetchWorkouts() // Refresh list after delete
  }

  const filteredWorkouts = workouts.filter(workout =>
    workout.exerciseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workout.notes && workout.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏃 การออกกำลังกาย</h1>
          <p className="text-gray-600 mt-1">
            บันทึกและติดตามการออกกำลังกายของคุณ
          </p>
        </div>
        <Link href="/workouts/new">
          <Button className="gap-2 h-11">
            <Plus size={20} />
            เพิ่มใหม่
          </Button>
        </Link>
      </div>

      {/* Quick Info Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-1">ทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-900">{pagination?.total || 0}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-600 font-semibold mb-1">หน้านี้</p>
            <p className="text-2xl font-bold text-orange-900">{filteredWorkouts.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border border-green-200">
            <p className="text-xs text-green-600 font-semibold mb-1">ประเภท</p>
            <p className="text-2xl font-bold text-green-900">{exerciseTypes.length - 1}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหาประเภทการออกกำลังกายหรือหมายเหตุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exerciseTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredWorkouts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || filterType !== 'ทั้งหมด' 
              ? 'ไม่พบข้อมูล'
              : 'ยังไม่มีการออกกำลังกาย'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'ทั้งหมด'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
              : 'เริ่มบันทึกการออกกำลังกายของคุณวันนี้!'
            }
          </p>
          {!searchTerm && filterType === 'ทั้งหมด' && (
            <Link href="/workouts/new">
              <Button>เพิ่มการออกกำลังกาย</Button>
            </Link>
          )}
        </div>
      )}

      {/* Workouts List */}
      {!loading && filteredWorkouts.length > 0 && (
        <>
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-gray-600">
                หน้า {pagination.page} จาก {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                ถัดไป
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
