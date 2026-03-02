# Project Fitness App

## ✨ Features

- 🔐 **Authentication** - ระบบล็อกอิน/สมัครสมาชิก
- 📊 **Dashboard** - สถิติและกราฟแสดงผล
- 🏃 **Workout CRUD** - จัดการการออกกำลังกาย
- 📈 **Analytics** - วิเคราะห์ข้อมูลเชิงลึก
- 🎯 **Goals** - ตั้งเป้าหมายและติดตาม
- 👤 **Profile** - จัดการโปรไฟล์
- ⚙️ **Settings** - ตั้งค่าและส่งออกข้อมูล

แอปพลิเคชันติดตามการออกกำลังกาย (Next.js + Prisma + PostgreSQL)

- Framework: Next.js (App Router)
- ORM: Prisma (PostgreSQL)
- Auth: JWT (token เก็บในคุกกี้ชื่อ `token`)

คุณสมบัติเด่น
- จัดการผู้ใช้ (register, login, logout)
- บันทึกและแสดงผลการออกกำลังกาย
- แดชบอร์ดสถิติ และกราฟต่าง ๆ

เทคสแตกหลัก
- Next.js (App Router)
- Prisma + PostgreSQL
- JWT (`jsonwebtoken` / `jose` used for verification in middleware)
- Tailwind CSS, Zustand, Zod

เริ่มต้น (Local development)

1. ติดตั้ง dependencies

```bash
npm install
```

2. ตั้งค่า environment

สร้างไฟล์ `.env` ที่รากโปรเจคและตั้งค่าอย่างน้อย:

- `DATABASE_URL` — สตริงเชื่อมต่อ PostgreSQL
- `JWT_SECRET` — ค่า secret สำหรับเซ็น JWT

ตัวอย่าง :

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret_here"
```

3. เตรียมฐานข้อมูล (Prisma)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. รันในโหมดพัฒนา

```bash
npm run dev
```

คำสั่งสำคัญใน `package.json`
- `dev` : รัน `next dev`
- `build` : รัน `next build`
- `start` : รัน `next start` (production)
- `lint` : รัน `eslint`

ข้อมูลสำคัญการยืนยันตัวตน
- คุกกี้ชื่อ `token` ถูกใช้เป็นค่า JWT cookie (ดู `src/middleware.ts`).
- ใน API routes token ถูกสร้างโดย `src/app/api/auth/login/route.ts` และตรวจสอบโดย `src/middleware.ts` (ใช้ `jose` สำหรับการตรวจสอบ).

โครงสร้างไฟล์ที่สำคัญ
- หน้า UI และ API routes อยู่ภายใต้ `src/app` (App Router)
- Prisma client singleton: `src/lib/prisma.ts`
- Auth helpers: `src/lib/auth.ts`
- Store ฝั่ง client: `src/lib/store/authStore.ts`

การพัฒนาเพิ่มเติม
- หากแก้ schema ให้รัน `npx prisma generate` และ `npx prisma migrate dev` ตามลำดับ
- ป้องกันการเผยความลับ: อย่าคอมมิต `.env` หรือค่าที่เป็นความลับ

การช่วยพัฒนา / Contributing
- สร้าง branch ใหม่จาก `main` และเปิด PR เมื่อพร้อม
- รัน `npm run lint` ก่อนส่ง PR

ลิขสิทธิ์
- ใส่ LICENSE ตามต้องการ (ยังไม่มี license กำหนดไว้ใน repo)

จุดเริ่มต้น
- ดูไฟล์เริ่มต้นและ API ตัวอย่างใน `src/app/api/auth/*` และ `src/middleware.ts` เพื่อเข้าใจ flow การยืนยันตัวตน# Fitness-copy
