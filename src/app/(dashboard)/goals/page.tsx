'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { Loader2, Target, Plus } from 'lucide-react'
import GoalCard from '@/components/goals/GoalCard'
import CreateGoalForm from '@/components/goals/CreateGoalForm'

export default function GoalsPage() {
  const { token } = useAuthStore()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchGoals()
  }, [activeTab])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const status = activeTab === 'all' ? 'all' : activeTab
      const response = await fetch(`/api/goals?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals)
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (error) {
      console.error('Fetch goals error:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    fetchGoals()
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    fetchGoals()
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 เป้าหมาย</h1>
          <p className="text-gray-600 mt-1">
            ตั้งเป้าหมายและติดตามความคืบหน้า
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus size={20} />
          {showCreateForm ? 'ซ่อนฟอร์ม' : 'สร้างเป้าหมาย'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <CreateGoalForm onSuccess={handleCreateSuccess} />
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">เป้าหมายทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600">กำลังดำเนินการ</p>
          <p className="text-2xl font-bold text-yellow-600">{activeGoals.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">สำเร็จแล้ว</p>
          <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({goals.length})</TabsTrigger>
          <TabsTrigger value="active">กำลังดำเนินการ ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">สำเร็จแล้ว ({completedGoals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'all' ? 'ยังไม่มีเป้าหมาย' : 
                 activeTab === 'active' ? 'ไม่มีเป้าหมายที่กำลังดำเนินการ' :
                 'ยังไม่มีเป้าหมายที่สำเร็จ'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' ? 'เริ่มสร้างเป้าหมายแรกของคุณวันนี้!' :
                 activeTab === 'active' ? 'สร้างเป้าหมายใหม่เพื่อท้าทายตัวเอง' :
                 'พยายามทำเป้าหมายให้สำเร็จ!'}
              </p>
              {activeTab !== 'completed' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  สร้างเป้าหมาย
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}