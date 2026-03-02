'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface ProfileHeaderProps {
  user: any
  onUploadAvatar?: () => void
}

export default function ProfileHeader({ user, onUploadAvatar }: ProfileHeaderProps) {
  return (
    <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-28 w-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
              )}
            </div>
            {onUploadAvatar && (
              <button
                onClick={onUploadAvatar}
                className="absolute bottom-0 right-0 h-10 w-10 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all duration-200 hover:scale-110"
              >
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold text-white">
              {user.name || user.username}
            </h2>
            <p className="text-blue-100 text-lg mt-1">@{user.username}</p>
            <p className="text-sm text-blue-50 mt-2">{user.email}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-blue-50 justify-center md:justify-start">
              <Calendar className="h-4 w-4" />
              <span>
                เข้าร่วมเมื่อ {user.createdAt ? format(new Date(user.createdAt), 'PPP', { locale: th }) : '-'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 md:gap-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {user.totalWorkouts}
              </p>
              <p className="text-xs text-blue-100 mt-1">การออกกำลังกาย</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {Math.round(user.totalCalories).toLocaleString()}
              </p>
              <p className="text-xs text-blue-100 mt-1">แคลอรี่</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">
                {Math.floor(user.totalDuration / 60)}
              </p>
              <p className="text-xs text-blue-100 mt-1">ชั่วโมง</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}