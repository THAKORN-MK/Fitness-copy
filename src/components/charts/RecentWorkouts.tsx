'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Activity, Flame, Clock } from 'lucide-react'

interface RecentWorkoutsProps {
  workouts: any[]
}

const TYPE_GLOW: Record<string, string> = {
  'วิ่ง':          'rgba(129,140,248,0.28)',
  'วิ่งเทรล':      'rgba(129,140,248,0.28)',
  'ปั่นจักรยาน':  'rgba(251,191,36,0.22)',
  'ว่ายน้ำ':       'rgba(34,211,238,0.24)',
  'เดิน':          'rgba(74,222,128,0.22)',
  'กระโดดเชือก':  'rgba(250,204,21,0.24)',
  'ยิม':           'rgba(168,85,247,0.26)',
  'โยคะ':          'rgba(244,114,182,0.24)',
  'เอโรบิก':      'rgba(236,72,153,0.26)',
  'มวย':           'rgba(248,113,113,0.28)',
  'บาสเก็ตบอล':   'rgba(251,146,60,0.24)',
  'ฟุตบอล':       'rgba(74,222,128,0.24)',
  'เทนนิส':       'rgba(251,191,36,0.22)',
  'แบดมินตัน':    'rgba(129,140,248,0.22)',
  'อื่นๆ':        'rgba(167,139,250,0.22)',
}

const TYPE_COLOR: Record<string, string> = {
  'วิ่ง':          '#818cf8',
  'วิ่งเทรล':      '#6366f1',
  'ปั่นจักรยาน':  '#fbbf24',
  'ว่ายน้ำ':       '#22d3ee',
  'เดิน':          '#4ade80',
  'กระโดดเชือก':  '#facc15',
  'ยิม':           '#a855f7',
  'โยคะ':          '#f472b6',
  'เอโรบิก':      '#ec4899',
  'มวย':           '#f87171',
  'บาสเก็ตบอล':   '#fb923c',
  'ฟุตบอล':       '#4ade80',
  'เทนนิส':       '#fbbf24',
  'แบดมินตัน':    '#818cf8',
  'อื่นๆ':        '#a78bfa',
}

const TYPE_EMOJI: Record<string, string> = {
  'วิ่ง':          '🏃',
  'วิ่งเทรล':      '🏔️',
  'ปั่นจักรยาน':  '🚴',
  'ว่ายน้ำ':       '🏊',
  'เดิน':          '🚶',
  'กระโดดเชือก':  '🪢',
  'ยิม':           '🏋️',
  'โยคะ':          '🧘',
  'เอโรบิก':      '💃',
  'มวย':           '🥊',
  'บาสเก็ตบอล':   '🏀',
  'ฟุตบอล':       '⚽',
  'เทนนิส':       '🎾',
  'แบดมินตัน':    '🏸',
  'อื่นๆ':        '⚡',
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  return (
    <Card style={{
      border: '1px solid rgba(139,92,246,0.2)',
      background: 'rgba(13,10,35,0.75)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 40px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      borderRadius: 20,
    }}>
      <CardHeader>
        <CardTitle style={{ color: '#e2d9f3', fontSize: 16, fontWeight: 700 }}>
          🏃 การออกกำลังกายล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workouts.map((workout, index) => {
              const col = TYPE_COLOR[workout.exerciseType] || '#a78bfa'
              const glow = TYPE_GLOW[workout.exerciseType] || 'rgba(139,92,246,0.18)'
              const emoji = TYPE_EMOJI[workout.exerciseType] || '⚡'
              return (
                <div
                  key={workout.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${glow}, rgba(13,10,35,0.6))`,
                    border: `1px solid ${col}33`,
                    boxShadow: `0 0 16px ${glow}`,
                    transition: 'all 0.2s',
                    animation: 'fadeInUp 0.4s ease both',
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: `${col}22`,
                    border: `1px solid ${col}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${col}44`,
                  }}>
                    {emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: col, fontSize: 15, marginBottom: 3 }}>
                      {workout.exerciseType}
                    </p>
                    <p style={{ color: '#7c6fa0', fontSize: 12 }}>
                      {format(new Date(workout.exerciseDate), 'PPP', { locale: th })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                      <Clock style={{ width: 13, height: 13, color: '#818cf8' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd' }}>
                        {workout.durationMinutes} นาที
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(236,72,153,0.12)',
                      border: '1px solid rgba(236,72,153,0.2)',
                    }}>
                      <Flame style={{ width: 13, height: 13, color: '#ec4899' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f9a8d4' }}>
                        {workout.caloriesBurned} cal
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: 200, color: '#7c6fa0', gap: 10,
          }}>
            <Activity style={{ width: 40, height: 40, color: '#4c1d95' }} />
            <p style={{ fontSize: 14 }}>ยังไม่มีข้อมูล</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}