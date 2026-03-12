'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { toast } from 'react-hot-toast'
import { Loader2, Save, Plus, ArrowLeft, Camera, X, Clock, Flame, Route, Calendar } from 'lucide-react'
import Link from 'next/link'

const EXERCISE_TYPES = [
  { value:'วิ่ง',         label:'วิ่ง',          icon:'🏃', hasDistance:true  },
  { value:'ปั่นจักรยาน',  label:'ปั่นจักรยาน',   icon:'🚴', hasDistance:true  },
  { value:'ว่ายน้ำ',      label:'ว่ายน้ำ',        icon:'🏊', hasDistance:true  },
  { value:'เดิน',         label:'เดิน',           icon:'🚶', hasDistance:true  },
  { value:'วิ่งเทรล',     label:'วิ่งเทรล',       icon:'🏔️', hasDistance:true  },
  { value:'กระโดดเชือก',  label:'กระโดดเชือก',   icon:'⚡', hasDistance:false },
  { value:'ยิม',          label:'ยิม',            icon:'🏋️', hasDistance:false },
  { value:'โยคะ',         label:'โยคะ',           icon:'🧘', hasDistance:false },
  { value:'เอโรบิก',      label:'เอโรบิก',        icon:'💃', hasDistance:false },
  { value:'มวย',          label:'มวย',            icon:'🥊', hasDistance:false },
  { value:'บาสเก็ตบอล',  label:'บาสเก็ตบอล',    icon:'🏀', hasDistance:false },
  { value:'ฟุตบอล',      label:'ฟุตบอล',         icon:'⚽', hasDistance:false },
  { value:'เทนนิส',       label:'เทนนิส',         icon:'🎾', hasDistance:false },
  { value:'แบดมินตัน',    label:'แบดมินตัน',      icon:'🏸', hasDistance:false },
  { value:'อื่นๆ',        label:'อื่นๆ',          icon:'✨', hasDistance:false },
]

const MET: Record<string, number> = {
  'วิ่ง':9.8,'ปั่นจักรยาน':7.5,'ว่ายน้ำ':8.0,'เดิน':3.8,'วิ่งเทรล':11.0,
  'กระโดดเชือก':12.3,'ยิม':5.0,'โยคะ':2.5,'เอโรบิก':6.5,'มวย':10.5,
  'บาสเก็ตบอล':6.5,'ฟุตบอล':7.0,'เทนนิส':7.3,'แบดมินตัน':5.5,'อื่นๆ':4.0,
}

const KCAL_PER_KM: Record<string, number> = {
  'วิ่ง': 1.04, 'วิ่งเทรล': 1.2, 'เดิน': 0.5,
  'ปั่นจักรยาน': 0.5, 'ว่ายน้ำ': 0.7,
}
const WEIGHT = 65

function calcCalories(type: string, durationMin: number, distanceKm?: number): number {
  const met   = MET[type] ?? 4.0
  const hours = durationMin / 60
  if (distanceKm && distanceKm > 0 && KCAL_PER_KM[type]) {
    return Math.round(KCAL_PER_KM[type] * distanceKm * WEIGHT)
  }
  return Math.round(met * WEIGHT * hours)
}

/**
 * แปลง Date → "YYYY-MM-DDTHH:mm" ตาม local timezone
 * ใช้แทน .toISOString().slice(0,16) ซึ่งจะได้ UTC time
 */
function toLocalDatetimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface WorkoutFormProps {
  mode: 'create' | 'edit'
  initialData?: any
  workoutId?: string
}

export default function WorkoutForm({ mode, initialData, workoutId }: WorkoutFormProps) {
  const router    = useRouter()
  const { token } = useAuthStore()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [loading,      setSaving]    = useState(false)
  const [uploading,    setUploading] = useState(false)
  const [imagePreview, setImgPrev]   = useState<string | null>(initialData?.imageUrl ?? null)
  const [imageFile,    setImageFile] = useState<File | null>(null)
  const [errors,       setErrors]    = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    exerciseType:    initialData?.exerciseType    ?? '',
    durationMinutes: initialData?.durationMinutes ?? '',
    distanceKm:      initialData?.distanceKm      ?? '',
    caloriesBurned:  initialData?.caloriesBurned  ?? '',
    notes:           initialData?.notes           ?? '',
    // ✅ แก้: ใช้ toLocalDatetimeInput แทน .toISOString().slice(0,16)
    // เพื่อให้ default value เป็นเวลาปัจจุบันตาม timezone ของเครื่อง
    exerciseDate: initialData?.exerciseDate
      ? toLocalDatetimeInput(new Date(initialData.exerciseDate))
      : toLocalDatetimeInput(new Date()),
  })

  const selected    = EXERCISE_TYPES.find(t => t.value === form.exerciseType)
  const hasDistance = selected?.hasDistance ?? false

  const clearError = (key: string) => setErrors(p => { const n = {...p}; delete n[key]; return n })

  const set = (k: string, v: string) => {
    const next = { ...form, [k]: v }
    if (['exerciseType', 'durationMinutes', 'distanceKm'].includes(k)) {
      const type = k === 'exerciseType' ? v : next.exerciseType
      const dur  = Number(k === 'durationMinutes' ? v : next.durationMinutes)
      const dist = Number(k === 'distanceKm' ? v : next.distanceKm) || undefined
      if (type && dur > 0) next.caloriesBurned = String(calcCalories(type, dur, dist))
    }
    if (k === 'durationMinutes') clearError('duration')
    if (k === 'distanceKm')      clearError('distance')
    if (k === 'caloriesBurned')  clearError('calories')
    if (k === 'exerciseType')    { next.distanceKm = ''; clearError('distance') }
    setForm(next)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('ไฟล์ไม่เกิน 10MB'); return }
    setImageFile(file)
    setImgPrev(URL.createObjectURL(file))
  }
  const removeImage = () => {
    setImageFile(null); setImgPrev(null)
    if (fileRef.current) fileRef.current.value = ''
  }
  const uploadImage = async (wid: string) => {
    if (!imageFile) return
    const fd = new FormData(); fd.append('file', imageFile)
    const res = await fetch(`/api/workouts/${wid}/image`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    })
    if (!res.ok) toast.error('อัปโหลดรูปไม่สำเร็จ')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErr: Record<string, string> = {}

    if (!form.exerciseType) { toast.error('กรุณาเลือกประเภทการออกกำลังกาย'); return }

    const dur = Number(form.durationMinutes)
    if (!form.durationMinutes || isNaN(dur) || dur <= 0)
      newErr.duration = form.durationMinutes === '' ? 'กรุณากรอกระยะเวลา' : 'ระยะเวลาต้องมากกว่า 0'

    if (hasDistance) {
      const dist = Number(form.distanceKm)
      if (form.distanceKm === '')
        newErr.distance = 'กรุณากรอกระยะทาง'
      else if (isNaN(dist) || dist <= 0)
        newErr.distance = 'ระยะทางต้องมากกว่า 0'
    }

    const cal = Number(form.caloriesBurned)
    if (!form.caloriesBurned || isNaN(cal) || cal < 0)
      newErr.calories = 'กรุณากรอกแคลอรี่ที่ถูกต้อง'

    setErrors(newErr)
    if (Object.keys(newErr).length > 0) return

    setSaving(true)
    try {
      const distVal = hasDistance && form.distanceKm ? Number(form.distanceKm) : null
      const body = {
        exerciseType:    form.exerciseType,
        durationMinutes: dur,
        caloriesBurned:  cal,
        distanceKm:      distVal && distVal > 0 ? distVal : null,
        intensity:       'medium',
        notes:           form.notes || null,
        // ✅ แก้: ส่งเป็น local ISO string โดยไม่แปลงเป็น UTC
        // "2025-03-13T21:57" → ส่งตรงๆ ไม่แปลงผ่าน new Date().toISOString()
        // backend จะได้เวลาที่ user กรอกจริงๆ
        exerciseDate: form.exerciseDate,
      }
      const url    = mode === 'edit' ? `/api/workouts/${workoutId}` : '/api/workouts'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        const wid = mode === 'edit' ? workoutId! : data.workout?.id
        if (imageFile && wid) { setUploading(true); await uploadImage(wid); setUploading(false) }
        toast.success(mode === 'edit' ? 'อัปเดตสำเร็จ!' : 'บันทึกสำเร็จ!')
        router.push('/workouts')
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch { toast.error('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=Sarabun:wght@400;500;600&display=swap');
        .wf{font-family:'Sarabun',sans-serif;color:#fff;max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
        .wf-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,.5);
          text-decoration:none;transition:color .15s;font-family:'Syne',sans-serif;font-weight:700}
        .wf-back:hover{color:rgba(255,255,255,.85)}
        .wf-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.5vw,26px);font-weight:800;letter-spacing:-.6px;margin-bottom:2px}
        .wf-sub{font-size:13px;color:rgba(255,255,255,.45)}
        .wf-card{border-radius:20px;padding:22px;background:rgba(13,13,26,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(14px)}
        .wf-section-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:800;
          color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;
          margin-bottom:14px;display:flex;align-items:center;gap:7px}
        .wf-section-title::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06)}
        .wf-types{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        @media(max-width:480px){.wf-types{grid-template-columns:repeat(3,1fr)}}
        .wf-type-btn{border-radius:13px;padding:11px 6px;border:1.5px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.03);cursor:pointer;text-align:center;transition:all .16s;outline:none}
        .wf-type-btn:hover{border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.07)}
        .wf-type-btn.sel{border-color:#818cf8;background:rgba(129,140,248,.12)}
        .wf-type-ico{font-size:22px;margin-bottom:4px}
        .wf-type-name{font-size:11px;font-weight:600;color:rgba(255,255,255,.6);line-height:1.2}
        .wf-type-btn.sel .wf-type-name{color:#c4b5fd}
        .wf-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);
          letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;
          display:flex;align-items:center;justify-content:space-between}
        .wf-lbl-req{color:#f87171;font-size:10px;font-weight:700;text-transform:none;letter-spacing:0}
        .wf-field{position:relative}
        .wf-field-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.3);pointer-events:none}
        .wf-input{width:100%;padding:11px 14px 11px 38px;border-radius:12px;
          background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
          color:#fff;font-family:'Sarabun',sans-serif;font-size:14px;outline:none;
          transition:border-color .18s,background .18s;box-sizing:border-box;-webkit-appearance:none}
        .wf-input::placeholder{color:rgba(255,255,255,.2)}
        .wf-input:focus{border-color:rgba(129,140,248,.55);background:rgba(255,255,255,.07)}
        .wf-input.err{border-color:rgba(248,113,113,.7) !important;background:rgba(248,113,113,.05) !important}
        .wf-input.cal{border-color:rgba(236,72,153,.35);color:#f9a8d4}
        textarea.wf-input{padding-left:14px;resize:vertical;min-height:72px}
        .wf-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:400px){.wf-row2{grid-template-columns:1fr}}
        .wf-err-msg{font-size:11px;color:#f87171;margin-top:5px;
          display:flex;align-items:center;gap:4px;font-weight:600;
          animation:_errIn .15s ease}
        @keyframes _errIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        .wf-cal-badge{position:absolute;right:12px;top:50%;transform:translateY(-50%);
          font-size:10px;font-weight:700;color:rgba(249,168,212,.7);
          background:rgba(236,72,153,.1);border-radius:5px;padding:2px 7px;
          font-family:'DM Mono',monospace;pointer-events:none}
        .wf-img-zone{border-radius:14px;border:2px dashed rgba(255,255,255,.1);
          background:rgba(255,255,255,.02);overflow:hidden;transition:border-color .18s}
        .wf-img-zone:hover{border-color:rgba(129,140,248,.35)}
        .wf-img-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:8px;padding:32px;cursor:pointer}
        .wf-img-placeholder-ico{width:44px;height:44px;border-radius:12px;
          background:rgba(129,140,248,.1);border:1px solid rgba(129,140,248,.2);
          display:flex;align-items:center;justify-content:center;color:#818cf8}
        .wf-img-placeholder-txt{font-size:13px;color:rgba(255,255,255,.4);text-align:center}
        .wf-img-placeholder-sub{font-size:11px;color:rgba(255,255,255,.25)}
        .wf-img-preview{position:relative}
        .wf-img-preview img{width:100%;height:200px;object-fit:cover;display:block}
        .wf-img-remove{position:absolute;top:8px;right:8px;width:28px;height:28px;
          border-radius:8px;background:rgba(0,0,0,.6);border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;color:#fff;transition:all .15s}
        .wf-img-remove:hover{background:rgba(239,68,68,.8)}
        .wf-submit{width:100%;padding:13px;border-radius:14px;border:none;cursor:pointer;
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#5b21b6,#7c3aed,#a21caf);
          box-shadow:0 4px 22px rgba(91,33,182,.4);transition:all .2s;
          display:flex;align-items:center;justify-content:center;gap:8px}
        .wf-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,58,237,.55)}
        .wf-submit:disabled{opacity:.55;cursor:not-allowed}
        input[type='datetime-local']::-webkit-calendar-picker-indicator{filter:invert(.5)}
      `}</style>

      <div className="wf">
        <Link href="/workouts" className="wf-back"><ArrowLeft size={15}/> กลับ</Link>
        <div>
          <div className="wf-title">{mode === 'edit' ? '✏️ แก้ไขการออกกำลังกาย' : '➕ เพิ่มการออกกำลังกาย'}</div>
          <div className="wf-sub">{mode === 'edit' ? 'แก้ไขรายละเอียดการออกกำลังกาย' : 'บันทึกการออกกำลังกายของคุณวันนี้'}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* ประเภท */}
          <div className="wf-card">
            <div className="wf-section-title">ประเภทการออกกำลังกาย</div>
            <div className="wf-types">
              {EXERCISE_TYPES.map(t => (
                <button key={t.value} type="button"
                  className={`wf-type-btn ${form.exerciseType === t.value ? 'sel' : ''}`}
                  onClick={() => set('exerciseType', t.value)}>
                  <div className="wf-type-ico">{t.icon}</div>
                  <div className="wf-type-name">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="wf-card">
            <div className="wf-section-title">รายละเอียด</div>

            {/* วันที่ */}
            <div style={{ marginBottom:14 }}>
              <div className="wf-lbl"><span>วันที่และเวลา</span></div>
              <div className="wf-field">
                <Calendar size={14} className="wf-field-ico"/>
                <input className="wf-input" type="datetime-local"
                  value={form.exerciseDate}
                  onChange={e => set('exerciseDate', e.target.value)} required/>
              </div>
            </div>

            {/* ระยะเวลา + ระยะทาง */}
            <div className={hasDistance ? 'wf-row2' : ''} style={{ marginBottom:14 }}>
              <div>
                <div className="wf-lbl">
                  <span>ระยะเวลา (นาที)</span>
                  <span className="wf-lbl-req">* จำเป็น</span>
                </div>
                <div className="wf-field">
                  <Clock size={14} className="wf-field-ico"/>
                  <input className={`wf-input${errors.duration ? ' err' : ''}`}
                    type="number" min="1" max="1440" placeholder="เช่น 30"
                    value={form.durationMinutes}
                    onChange={e => set('durationMinutes', e.target.value)}/>
                </div>
                {errors.duration && <div className="wf-err-msg">⚠ {errors.duration}</div>}
              </div>

              {hasDistance && (
                <div>
                  <div className="wf-lbl">
                    <span>ระยะทาง (km)</span>
                    <span className="wf-lbl-req">* จำเป็น</span>
                  </div>
                  <div className="wf-field">
                    <Route size={14} className="wf-field-ico"/>
                    <input className={`wf-input${errors.distance ? ' err' : ''}`}
                      type="number" min="0.01" step="0.01" placeholder="เช่น 5.0"
                      value={form.distanceKm}
                      onChange={e => set('distanceKm', e.target.value)}/>
                  </div>
                  {errors.distance && <div className="wf-err-msg">⚠ {errors.distance}</div>}
                </div>
              )}
            </div>

            {/* แคลอรี่ */}
            <div>
              <div className="wf-lbl">
                <span>แคลอรี่ที่เผาผลาญ</span>
                <span style={{ fontSize:10, color:'rgba(249,168,212,.6)', fontWeight:600, textTransform:'none', letterSpacing:0 }}>
                  คำนวณอัตโนมัติ — แก้ไขได้
                </span>
              </div>
              <div className="wf-field">
                <Flame size={14} className="wf-field-ico" style={{ color:'#f472b6' }}/>
                <input className={`wf-input cal${errors.calories ? ' err' : ''}`}
                  type="number" min="0" step="1" placeholder="cal"
                  value={form.caloriesBurned}
                  onChange={e => set('caloriesBurned', e.target.value)}/>
                <span className="wf-cal-badge">cal</span>
              </div>
              {errors.calories && <div className="wf-err-msg">⚠ {errors.calories}</div>}
            </div>
          </div>

          {/* รูปภาพ */}
          <div className="wf-card">
            <div className="wf-section-title">รูปภาพ (ไม่บังคับ)</div>
            <div className="wf-img-zone">
              {imagePreview ? (
                <div className="wf-img-preview">
                  <img src={imagePreview} alt="workout"/>
                  <button type="button" className="wf-img-remove" onClick={removeImage}>
                    <X size={14}/>
                  </button>
                </div>
              ) : (
                <div className="wf-img-placeholder" onClick={() => fileRef.current?.click()}>
                  <div className="wf-img-placeholder-ico"><Camera size={20}/></div>
                  <div className="wf-img-placeholder-txt">แตะเพื่อเพิ่มรูปภาพ</div>
                  <div className="wf-img-placeholder-sub">JPG, PNG, WEBP — ไม่เกิน 10MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display:'none' }} onChange={handleImageChange}/>
          </div>

          {/* โน้ต */}
          <div className="wf-card">
            <div className="wf-section-title">บันทึกเพิ่มเติม</div>
            <div className="wf-field">
              <textarea className="wf-input"
                placeholder="บันทึกความรู้สึก เส้นทาง หรือรายละเอียดเพิ่มเติม..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}/>
            </div>
          </div>

          <button type="submit" className="wf-submit" disabled={loading || uploading}>
            {loading || uploading
              ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>{uploading ? ' กำลังอัปโหลดรูป...' : ' กำลังบันทึก...'}</>
              : mode === 'edit'
                ? <><Save size={15}/> บันทึกการเปลี่ยนแปลง</>
                : <><Plus size={15}/> บันทึกการออกกำลังกาย</>}
          </button>
        </form>
      </div>
    </>
  )
}