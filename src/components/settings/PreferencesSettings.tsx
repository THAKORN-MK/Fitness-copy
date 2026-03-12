'use client'

interface Preferences {
  language: string
  weekStartsOn: string
  defaultWorkoutView: string
}

interface Props {
  preferences: Preferences
  onPreferenceChange: (key: string, value: string) => void
}

export default function PreferencesSettings({ preferences, onPreferenceChange }: Props) {
  const sections = [
    {
      key: 'language',
      label: 'ภาษา / Language',
      icon: '🌐',
      options: [
        { value: 'th', label: 'ภาษาไทย', sub: 'Thai', flag: '🇹🇭' },
        { value: 'en', label: 'English', sub: 'อังกฤษ (เร็วๆ นี้)', flag: '🇬🇧' },
      ],
    },
    {
      key: 'weekStartsOn',
      label: 'วันเริ่มต้นสัปดาห์',
      icon: '📅',
      options: [
        { value: 'monday', label: 'วันจันทร์', sub: 'Monday', flag: '💛' },
        { value: 'sunday', label: 'วันอาทิตย์', sub: 'Sunday', flag: '❤️' },
      ],
    },
    {
      key: 'defaultWorkoutView',
      label: 'มุมมองการออกกำลังกาย',
      icon: '👁️',
      options: [
        { value: 'list', label: 'รายการ', sub: 'List View', flag: '☰' },
        { value: 'grid', label: 'ตาราง', sub: 'Grid View (เร็วๆ นี้)', flag: '⊞' },
      ],
    },
  ]

  const current: Record<string, string> = {
    language: preferences.language,
    weekStartsOn: preferences.weekStartsOn,
    defaultWorkoutView: preferences.defaultWorkoutView,
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: 28,
    }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, rgba(129,140,248,0.25), rgba(168,85,247,0.25))',
          border: '1px solid rgba(129,140,248,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>🎛️</div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: 0 }}>ความชอบส่วนตัว</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>ปรับแต่งประสบการณ์การใช้งาน</p>
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.key}>
            {/* Section Label */}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 13 }}>{section.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
                {section.label}
              </span>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${section.options.length}, 1fr)`, gap: 10 }}>
              {section.options.map((opt) => {
                const isActive = current[section.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onPreferenceChange(section.key, opt.value)}
                    style={{
                      position: 'relative',
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: isActive
                        ? '1.5px solid rgba(129,140,248,0.7)'
                        : '1.5px solid rgba(255,255,255,0.07)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(129,140,248,0.18), rgba(168,85,247,0.12))'
                        : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      outline: 'none',
                    }}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 14,
                        background: 'radial-gradient(ellipse at top left, rgba(129,140,248,0.12), transparent 70%)',
                        pointerEvents: 'none',
                      }} />
                    )}

                    <div className="flex items-center gap-3">
                      {/* Icon/Flag */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: isActive ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.06)',
                        border: isActive ? '1px solid rgba(129,140,248,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                        transition: 'all 0.2s',
                      }}>
                        {opt.flag}
                      </div>

                      {/* Text */}
                      <div>
                        <div style={{
                          fontSize: 14, fontWeight: 600,
                          color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.75)',
                          transition: 'color 0.2s',
                        }}>
                          {opt.label}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: isActive ? 'rgba(196,181,253,0.6)' : 'rgba(255,255,255,0.3)',
                          transition: 'color 0.2s',
                        }}>
                          {opt.sub}
                        </div>
                      </div>

                      {/* Check indicator */}
                      {isActive && (
                        <div style={{
                          marginLeft: 'auto',
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: 'white', flexShrink: 0,
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}